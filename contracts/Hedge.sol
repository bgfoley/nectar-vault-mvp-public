// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IOrderCallbackReceiver} from "./interfaces/IOrderCallbackReceiver.sol";
import {Router} from "./interfaces/Router.sol";
import {Order} from "./lib/Order.sol";
import {EventUtils} from "./lib/EventUtils.sol";
import {IBaseOrderUtils} from "./interfaces/IBaseOrderUtils.sol";
import {IRoleStore} from "./interfaces/IRoleStore.sol";
import {IReader} from "./interfaces/IReader.sol";
import {IDataStore} from "./interfaces/IDataStore.sol";

/**
 * @title Hedge
 * @notice This contract allows users to deposit ETH to enter a delta neutral position on GMX V2. Shares represent USD
 *      value of the users' position and can be posted as collateral to mint necUSD.
 * @dev This contract interacts with GMX's Exchange Router and Order Callback Receiver.
 */
contract Hedge is ERC20, Ownable, IOrderCallbackReceiver {
    using SafeERC20 for IERC20;

    event HedgeOpened(address indexed user, bytes32 key, uint256 sizeDeltaUsd);
    event HedgeClosed(address indexed user, bytes32 key, uint256 sizeDeltaUsd);
    event OrderExecuted(address indexed user, bytes32 key, uint256 collateralAmount);
    event OrderCancelled(address indexed user, bytes32 key, uint256 collateralAmount);
    event OrderFrozen(address indexed user, bytes32 key);

    /// @dev Mapping from key to OrderInfo
    mapping(bytes32 => address) public orders;

    /// @dev Mapping from user address to list of orderKeys
    mapping(address => bytes32[]) public accountOrders;

    /// @dev Mapping from user address to locked shares
    mapping(address => uint256) public lockedShares;

    address public constant GMX_ROUTER = 0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8;
    address public constant ORDER_VAULT = 0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5;
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant GMX_MARKET = 0x70d95587d40A2caf56bd97485aB3Eec10Bee6336;
    address public constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
    bytes32 private constant GMX_CONTROLLER = 0x97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b;
    address public immutable HEDGE_VAULT = address(this);
    
    /// @dev GMX rolestore 
    IRoleStore public roleStore;
    /// @dev GMX reader contract 
    IReader public reader;
    /// @dev GMX datastore
    IDataStore public dataStore;

    /// @dev default address parameters for Hedge orders
    IBaseOrderUtils.CreateOrderParamsAddresses public defaultOrderParamsAddresses;

    /**
     * @notice Constructs the Hedge contract
     * @dev Sets the ERC20 token details and initializes Ownable
     * @param _roleStore The address of GMX's RoleStore contract
     * @param _reader The address of GMX's Reader contract
     * @param _dataStore The address of GMX's DataStore contract 
     */
    constructor(
        address _roleStore, 
        address _reader,
        address _dataStore
        )
         ERC20("HedgeVault", "HEDGE") Ownable(msg.sender) {
        roleStore = IRoleStore(_roleStore);
        reader = IReader(_reader);
        dataStore = IDataStore(_dataStore);

        // Initialize the default order params addresses
        defaultOrderParamsAddresses = IBaseOrderUtils.CreateOrderParamsAddresses({
            receiver: HEDGE_VAULT,
            callbackContract: HEDGE_VAULT,
            uiFeeReceiver: ZERO_ADDRESS,
            market: GMX_MARKET,
            initialCollateralToken: WETH,
            swapPath: new address  // Assuming swap path is empty by default
        });
    }

    /**
     * @notice Get the size of the short position held by the contract's account
     * @return The size of the short position in USD
     */
    function getPositionSizeUsd() external view returns (uint256) {
        Position.Props[] memory positions = reader.getAccountPositions(address(dataStore), address(this), 0, 1);
        if (positions.length > 0 && !positions[0].isLong) {
            return positions[0].numbers.sizeInUsd;
        }
        return 0;
    }

    /**
     * @notice Get the size of the short position held by the contract's account
     * @return The size of the short position in tokens
     */
    function getPositionSizeTokens() external view returns (uint256) {
        Position.Props[] memory positions = reader.getAccountPositions(address(dataStore), address(this), 0, 1);
        if (positions.length > 0 && !positions[0].isLong) {
            return positions[0].numbers.sizeInTokens;
        }
        return 0;
    }

    /**
     * @notice Get the amount of collateral held by the contract's account
     * @return The size of the short position in USD
     */
    function getCollateralAmount() external view returns (uint256) {
        Position.Props[] memory positions = reader.getAccountPositions(address(dataStore), address(this), 0, 1);
        if (positions.length > 0 && !positions[0].isLong) {
            return positions[0].numbers.collateralAmount;
        }
        return 0;
    }

    /**
     * @notice Converts USD value in 1e30 to vault shares in 1e18
     * @param usdAmount The USD value to be converted, denominated in 1e30
     * @return The equivalent amount of vault shares, denominated in 1e18
     */
    function usdToShares(uint256 usdAmount) internal pure returns (uint256) {
        return usdAmount / 1e12;
    }

    /**
     * @notice Converts vault shares in 1e18 to USD value in 1e30
     * @param sharesAmount The amount of vault shares to be converted, denominated in 1e18
     * @return The equivalent USD value, denominated in 1e30
     */
    function sharesToUsd(uint256 sharesAmount) internal pure returns (uint256) {
        return sharesAmount * 1e12;
    }

    /**
     * @notice Initiates the process to open a hedge position. Shares are not minted until
     *    afterOrderExecution is called
     * @param amount The amount of WETH to hedge
     * @param acceptablePrice The acceptable price for the order
     * @return key The unique identifier for the created order
     * @return orderAccount The user account associated with the order
     */
    function hedge(
        uint256 amount,
        uint256 acceptablePrice
    ) external returns (bytes32 key, address orderAccount) {      
        // Validate order params
        _validateOrderParams(orderParams, amount);

        uint256 executionFee = 3000000000000; // Assumed execution fee in wei (3e-06 ETH)
        uint256 initialCollateralDeltaAmount = amount - executionFee;
        uint256 sizeDeltaUsd = (initialCollateralDeltaAmount * acceptablePrice) / 1e18;

        IBaseOrderUtils.CreateOrderParamsNumbers memory orderParamsNumbers = IBaseOrderUtils.CreateOrderParamsNumbers({
            sizeDeltaUsd: sizeDeltaUsd,
            initialCollateralDeltaAmount: initialCollateralDeltaAmount,
            triggerPrice: 0,
            acceptablePrice: acceptablePrice,
            executionFee: executionFee,
            callbackGasLimit: 3_000_000, 
            minOutputAmount: 0
        });

        IBaseOrderUtils.CreateOrderParams memory orderParams = IBaseOrderUtils.CreateOrderParams({
            addresses: defaultOrderParamsAddresses,
            numbers: orderParamsNumbers,
            orderType: Order.OrderType.MarketIncrease,
            decreasePositionSwapType: Order.DecreasePositionSwapType.NoSwap,
            isLong: false,
            shouldUnwrapNativeToken: true,
            referralCode: bytes32(0)
        });
        (key, orderAccount) = _hedge(amount, msg.sender, orderParams);
    }

    /**
     * @notice Internal function to handle order creation for hedge position
     * @param amount The amount of WETH to hedge, includes execution fee
     * @param user The address of the user initiating the hedge
     * @param orderParams The order parameters for creating the hedge order
     * @return key The unique identifier for the created order
     * @return orderAccount The user account associated with the order
     */
    function _hedge(
        uint256 amount,
        address user,
        IBaseOrderUtils.CreateOrderParams calldata orderParams
    ) internal returns (bytes32 key, address orderAccount) {
        // Transfer funds to GMX Exchange Router
        IERC20(WETH).safeTransferFrom(user, ORDER_VAULT, amount);

        // Call Exchange Router to createOrder
        key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = user;
        orderAccount = user;

        // Emit HedgeOpened event
        emit HedgeOpened(user, key, orderParams.numbers.sizeDeltaUsd);
    }

    /**
     * @notice Initiates the closing of a hedge position
     * @param user The address of the user unhedging
     * @param shares The quantity of shares to unhedge
     * @param orderParams The order parameters for creating the unhedge order
     */
    function unHedge(
        uint256 shares,
        uint256 acceptablePrice
    ) external {
        // Validate order params
        _validateOrderParams(orderParams, shares);

        uint256 executionFee = 3000000000000; // Assumed execution fee in wei (3e-06 ETH)
        uint256 initialCollateralDeltaAmount = (sharesToUsd(shares) / acceptablePrice) * 1e18; // Convert shares to collateral amount
        uint256 sizeDeltaUsd = sharesToUsd(shares);

        IBaseOrderUtils.CreateOrderParamsNumbers memory orderParamsNumbers = IBaseOrderUtils.CreateOrderParamsNumbers({
            sizeDeltaUsd: sizeDeltaUsd,
            initialCollateralDeltaAmount: initialCollateralDeltaAmount,
            triggerPrice: 0,
            acceptablePrice: acceptablePrice,
            executionFee: executionFee,
            callbackGasLimit: 3_000_000, // Set to 3 million gas
            minOutputAmount: 0
        });

        IBaseOrderUtils.CreateOrderParams memory orderParams = IBaseOrderUtils.CreateOrderParams({
            addresses: defaultOrderParamsAddresses,
            numbers: orderParamsNumbers,
            orderType: Order.OrderType.MarketDecrease,
            decreasePositionSwapType: Order.DecreasePositionSwapType.NoSwap,
            isLong: false,
            shouldUnwrapNativeToken: true,
            referralCode: bytes32(0)
        });
        _unHedge(msg.sender, shares, orderParams);
    }
    
    /**
     * @notice Internal function to handle the unhedging process
     * @dev This function locks the shares, transfers the execution fee, and creates the order via the GMX Exchange Router
     * @param user The address of the user initiating the unhedge
     * @param shares The number of shares to unhedge
     * @param orderParams The order parameters for creating the unhedge order
     */
    function _unHedge(
        address user,
        uint256 shares,
        IBaseOrderUtils.CreateOrderParams calldata orderParams
    ) internal {
        // Check user's available shares, considering locked shares
        require(balanceOf(user) - lockedShares[user] >= shares, "Insufficient balance");

        // Lock the shares
        lockedShares[user] += shares;

        // Transfer execution fee to orderVault
        IERC20(WETH).safeTransferFrom(user, ORDER_VAULT, orderParams.numbers.executionFee);

        // Call Exchange Router to createOrder
        bytes32 key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = user;

        // Emit HedgeClosed event
        emit HedgeClosed(user, key, orderParams.numbers.sizeDeltaUsd);
    }

    /**
     * @notice Internal function to remove an order from the account mappings
     * @param key The unique identifier of the order
     * @param user The address of the user associated with the order
     */
    function _removeOrder(bytes32 key, address user) internal {
        delete orders[key];
        // Find and remove the key from the user's order list
        bytes32[] storage _accountOrders = accountOrders[user];
        for (uint256 i = 0; i < _accountOrders.length; ) {
            if (_accountOrders[i] == key) {
                _accountOrders[i] = _accountOrders[_accountOrders.length - 1];
                _accountOrders.pop();
                break;
            }
            unchecked { i++; } // Safe increment using unchecked block
        }
    }

    /**
     * @notice Callback function called by GMX after order execution
     * @param key The unique identifier of the executed order
     * @param order The properties of the executed order
     * @param eventData Additional event data
     */
    function afterOrderExecution(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external override {
        require(roleStore.hasRole(msg.sender, GMX_CONTROLLER), "Invalid role");

        address _user = orders[key];
        _removeOrder(key, _user);

        if (order.numbers.orderType == Order.OrderType.MarketIncrease) {
            uint256 sharesToMint = usdToShares(order.numbers.sizeDeltaUsd);
            _mint(_user, sharesToMint);
        } else if (order.numbers.orderType == Order.OrderType.MarketDecrease) {
            uint256 sharesToBurn = usdToShares(order.numbers.sizeDeltaUsd);
            if (lockedShares[_user] >= sharesToBurn && balanceOf(_user) >= sharesToBurn) {
                // User has enough shares, proceed with burn and transfer
                _burn(_user, sharesToBurn);
                IERC20(WETH).safeTransferFrom(ORDER_VAULT, _user, order.numbers.initialCollateralDeltaAmount);
                lockedShares[_user] -= sharesToBurn;
            } else {
                // User does not have enough shares, contract holds the WETH
                IERC20(WETH).safeTransferFrom(ORDER_VAULT, address(this), order.numbers.initialCollateralDeltaAmount);
                // Log this event for later reconciliation
                emit OrderExecuted(address(this), key, order.numbers.initialCollateralDeltaAmount);
            }
        } else {
            // Handle unexpected order types if necessary
            revert("Unexpected order type");
        }

        emit OrderExecuted(_user, key, order.numbers.initialCollateralDeltaAmount);
    }


    /**
     * @notice Callback function called after order cancellation
     * @param key The unique identifier of the cancelled order
     * @param order The properties of the cancelled order
     * @param eventData Additional event data
     */
    function afterOrderCancellation(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external override {
        // Validate message origin as GMX Controller
        require(roleStore.hasRole(msg.sender, GMX_CONTROLLER), "Invalid role");
        
        // Get user account
        address _user = orders[key];

        // Remove from account orders list
        _removeOrder(key, _user);

        // If increaseOrder (Hedge) then return collateral to depositor
        if (order.numbers.orderType == Order.OrderType.MarketIncrease) {
            // Transfer the collateral back to the order receiver
            IERC20(WETH).transferFrom(ORDER_VAULT, _user, order.numbers.initialCollateralDeltaAmount);
        } else if (order.numbers.orderType == Order.OrderType.MarketDecrease) {
            // Unlock shares
            lockedShares[_user] -= order.numbers.sizeDeltaUsd;
        }

        // Emit order cancelled event
        emit OrderCancelled(_user, key, order.numbers.initialCollateralDeltaAmount);
    }

    /**
     * @notice Callback function called after an order has been frozen
     * @param key The unique identifier of the frozen order
     * @param order The properties of the frozen order
     * @param eventData Additional event data
     */
    function afterOrderFrozen(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external override {
        // Validate message origin as GMX Controller
        require(roleStore.hasRole(msg.sender, GMX_CONTROLLER), "Invalid role");
        
        // Get user account
        address _user = orders[key];

        // Emit order frozen event
        emit OrderFrozen(_user, key);
        
        // Automatically cancel the frozen order
        Router(GMX_ROUTER).cancelOrder(key);
    }

    /**
     * @notice Internal function to validate order parameters
     * @dev This function ensures the amount and acceptable price are valid
     * @param amount The amount associated with the order
     * @param acceptablePrice The acceptable price for the order
     */
    function _validateOrderParams(uint256 amount, uint256 acceptablePrice) internal view {
        // Ensure the amount is greater than zero
        require(amount > 0, "Invalid deposit amount");
        // Ensure the acceptable price is greater than zero
        require(acceptablePrice > 0, "Invalid acceptable price");

        // Optionally, add any other relevant checks specific to your contract's logic
        // Example: Check if the amount is within an acceptable range
        // require(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT, "Amount out of range");

        // Example: Check if the acceptable price is within an acceptable range
        // require(acceptablePrice >= MIN_ACCEPTABLE_PRICE && acceptablePrice <= MAX_ACCEPTABLE_PRICE, "Acceptable price out of range");
    }

    /**
     * @notice Claims funding fees from the GMX Router
     * @dev This function can only be called by the owner and claims fees for WETH and USDC tokens
     * @return An array of funding fees claimed for each token
     */
    function claimFundingFees() public onlyOwner returns (uint256[] memory) {
   
        address[] memory markets = new address[](2);
        address[] memory tokens = new address[](2);
        
        markets[0] = GMX_MARKET;
        markets[1] = GMX_MARKET;
        tokens[0] = WETH;
        tokens[1] = USDC;
        
        // Call the claimFundingFees function
        return Router(GMX_ROUTER).claimFundingFees(markets, tokens, HEDGE_VAULT);
    }
    
    /**
     * @notice Owner-only function to place any order for testing or emergency purposes
     * @param orderParams The order parameters for creating the order
     * @param amount The amount of WETH to transfer to the GMX Order Vault
     */
    function ownerPlaceOrder(IBaseOrderUtils.CreateOrderParams calldata orderParams, uint256 amount) external onlyOwner {
        // Transfer WETH from the owner to the GMX Order Vault
        IERC20(WETH).safeTransferFrom(msg.sender, ORDER_VAULT, amount);

        // Call the Exchange Router to create the order
        bytes32 key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[msg.sender].push(key);
        orders[key] = msg.sender;

        // Emit HedgeOpened event for tracking
        emit HedgeOpened(msg.sender, key, orderParams.numbers.sizeDeltaUsd);
    }

    /**
     * @notice For test purposes only. Recovers any stuck funds in the contract
     * @param token The address of the token to recover
     */
    function recoverStuckFunds(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to recover");
        IERC20(token).safeTransfer(owner(), balance);
    }
}


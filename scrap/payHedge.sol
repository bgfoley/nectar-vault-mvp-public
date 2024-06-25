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


/**
 * @title Hedge
 * @notice This contract allows users to deposit ETH to enter a delta neutral position on GMX V2. Shares represent USD
 *      value of the users' position and can be posted as collateral to mint necUSD.
 * @dev This contract interacts with GMX's Exchange Router and Order Callback Receiver.
 */
contract PaySmdge is ERC20, Ownable, IOrderCallbackReceiver {
    using SafeERC20 for IERC20;

    event HedgeOpened(address indexed user, bytes32 key, uint256 sizeDeltaUsd);
    event HedgeClosed(address indexed user, bytes32 key, uint256 sizeDeltaUsd);
    event OrderExecuted(address indexed user, bytes32 key, uint256 collateralAmount);
    event OrderCancelled(address indexed user, bytes32 key, uint256 collateralAmount);
    event OrderFrozen(address indexed user, bytes32 key);
    
    // For debugging
    event UnexpectedOrderType(bytes32 key);

    bool public paused;
    
    /// @dev Mapping from key to OrderInfo
    mapping(bytes32 => address) public orders;

    /// @dev Mapping from user address to list of orderKeys
    mapping(address => bytes32[]) public accountOrders;
/*
    /// @dev Mapping from user address to pending shares
    mapping(address => uint256) public pendingShares;
*/    
    /// @dev Mapping from user address to locked shares
    mapping(address => uint256) public lockedShares;

    address public constant GMX_ROUTER = 0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8;
    address public constant ORDER_VAULT = 0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5;
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant GMX_MARKET = 0x450bb6774Dd8a756274E0ab4107953259d2ac541;
    address public constant ROLESTORE_ADDRESS = 0x3c3d99FD298f679DBC2CEcd132b4eC4d0F5e6e72;
    address public constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
    address public immutable HEDGE_VAULT = address(this);
    bytes32 private constant GMX_CONTROLLER = 0x97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b;
//  address public constant READER_ADDRESS = 0x22199a49A999c351eF7927602CFB187ec3cae489;
//  address public constant DATASTORE_ADDRESS = 0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8;
    uint256 private constant EXECUTION_FEE = 114000000000000; 

    /// @dev GMX rolestore 
    IRoleStore public roleStore;
 /*
    /// @dev GMX reader contract 
    IReader public reader;
    /// @dev GMX datastore
    IDataStore public dataStore;
*/
    /// @dev default address parameters for Hedge orders
    IBaseOrderUtils.CreateOrderParamsAddresses public defaultOrderParamsAddresses;

    /**
     * @notice Constructs the Hedge contract
     * @dev Sets the ERC20 token details and initializes Ownable
     */
    constructor() ERC20("ShMoodge", "ShMdge") Ownable(msg.sender) {}

    /**
     * @notice Initializes the contract with necessary addresses
     * @dev This function must be called after deployment to set the required addresses
     */
    function initialize() external onlyOwner {
        roleStore = IRoleStore(ROLESTORE_ADDRESS);
        defaultOrderParamsAddresses = IBaseOrderUtils.CreateOrderParamsAddresses({
            receiver: address(this),
            callbackContract: address(this),
            uiFeeReceiver: ZERO_ADDRESS,
            market: GMX_MARKET,
            initialCollateralToken: WETH,
            swapPath: new address[](0) 
        });
    }

    receive() external payable {}

    // Modifier to check if contract is paused
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    // Function to pause/unpause the contract
    function togglePause() external onlyOwner {
        paused = !paused;
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

    // Function to calculate the acceptable price based on the amount and minimum shares out
    function calculatePriceFromShares(uint256 amount, uint256 minimumSharesOut) internal pure returns (uint256) {
        // acceptablePrice is calculated based on the required shares and amount
        return (minimumSharesOut * 1e18) / amount;
    }

    function hedge(
        uint256 amount,
        uint256 minimumSharesOut
    ) external payable whenNotPaused returns (bytes32 key, address orderAccount) {      
        // Validate order params
    // _validateOrderParams(amount, minimumSharesOut);

        uint256 initialCollateralDeltaAmount = amount;
        uint256 payableAmount = amount + EXECUTION_FEE;
        require(msg.value >= payableAmount, "Insufficient execution fee");

        // Calculate acceptablePrice based on minimumSharesOut and amount
        uint256 acceptablePrice = calculatePriceFromShares(amount, minimumSharesOut);

        // Calculate sizeDeltaUsd with 1e30 precision for GMX
        uint256 sizeDeltaUsd = (initialCollateralDeltaAmount * acceptablePrice) / 1e6; // Adjusted for 30 decimals

        IBaseOrderUtils.CreateOrderParamsNumbers memory orderParamsNumbers = IBaseOrderUtils.CreateOrderParamsNumbers({
            sizeDeltaUsd: sizeDeltaUsd,
            initialCollateralDeltaAmount: initialCollateralDeltaAmount,
            triggerPrice: 0,
            acceptablePrice: acceptablePrice,
            executionFee: EXECUTION_FEE,
            callbackGasLimit: 3000000, 
            minOutputAmount: 0
        });

        IBaseOrderUtils.CreateOrderParams memory orderParams = IBaseOrderUtils.CreateOrderParams({
            addresses: defaultOrderParamsAddresses,
            numbers: orderParamsNumbers,
            orderType: Order.OrderType.MarketIncrease,
            decreasePositionSwapType: Order.DecreasePositionSwapType.NoSwap,
            isLong: false,
            shouldUnwrapNativeToken: false,
            referralCode: bytes32(0)
        });

        (key, orderAccount) = _hedge(msg.sender, orderParams);
    }

    function _hedge(
        address user,
        IBaseOrderUtils.CreateOrderParams memory orderParams
    ) internal returns (bytes32 key, address orderAccount) {
        uint256 totalFee = orderParams.numbers.initialCollateralDeltaAmount + EXECUTION_FEE;

        // Transfer funds to GMX Order Vault
        Router(GMX_ROUTER).sendWnt{value: totalFee}(ORDER_VAULT, totalFee); 

        // Call Exchange Router to createOrder
        key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = user;
        orderAccount = user;

        // Emit HedgeOpened event
        emit HedgeOpened(user, key, orderParams.numbers.sizeDeltaUsd);
    }

    function unHedge(
        uint256 amount, // shares out
        uint256 minimumOut // Eth returned
    ) external payable whenNotPaused returns (bytes32 key, address orderAccount) {      
        // Validate order params
    //   _validateOrderParams(amount, acceptablePrice);

        uint256 payableAmount = EXECUTION_FEE;
        require(msg.value >= payableAmount, "Insufficient execution fee");

        // Calculate price
        uint256 acceptablePrice = (amount * 1e18) / minimumOut; 

        //calculate size delta 
        uint256 sizeDeltaUsd = (acceptablePrice * amount) / 1e6; // Adjusted for 30 decimals

        IBaseOrderUtils.CreateOrderParamsNumbers memory orderParamsNumbers = IBaseOrderUtils.CreateOrderParamsNumbers({
            sizeDeltaUsd: sizeDeltaUsd,
            initialCollateralDeltaAmount: minimumOut,
            triggerPrice: 0,
            acceptablePrice: acceptablePrice,
            executionFee: EXECUTION_FEE,
            callbackGasLimit: 3000000, 
            minOutputAmount: 0
        });

        IBaseOrderUtils.CreateOrderParams memory orderParams = IBaseOrderUtils.CreateOrderParams({
            addresses: defaultOrderParamsAddresses,
            numbers: orderParamsNumbers,
            orderType: Order.OrderType.MarketDecrease,
            decreasePositionSwapType: Order.DecreasePositionSwapType.NoSwap,
            isLong: false,
            shouldUnwrapNativeToken: false,
            referralCode: bytes32(0)
        });

        (key, orderAccount) = _unHedge(msg.sender, orderParams);
    }

    function _unHedge(
        address user,
        IBaseOrderUtils.CreateOrderParams memory orderParams
    ) internal returns (bytes32 key, address orderAccount) {
        uint256 totalFee = orderParams.numbers.executionFee; // executionFee covers all necessary costs

        // Transfer funds to GMX Order Vault
        Router(GMX_ROUTER).sendWnt{value: totalFee}(ORDER_VAULT, totalFee);

        // Call Exchange Router to createOrder
        key = Router(GMX_ROUTER).createOrder{value: totalFee}(orderParams);
        
        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = user;
        orderAccount = user;

        // Emit HedgeClosed event
        emit HedgeClosed(user, key, orderParams.numbers.sizeDeltaUsd);
    }

/*


    function hedge(
        uint256 amount,
        uint256 minimumSharesOut
    ) external payable whenNotPaused returns (bytes32 key, address orderAccount) {      
        // Validate order params
       // _validateOrderParams(amount, minimumSharesOut);

        uint256 initialCollateralDeltaAmount = amount;
        uint256 payableAmount = amount + EXECUTION_FEE;
        require(msg.value >= payableAmount, "Insufficient execution fee");

        // Calculate acceptablePrice based on minimumSharesOut and amount
        uint256 acceptablePrice = calculatePriceFromShares(amount, minimumSharesOut);

        // Calculate sizeDeltaUsd with 1e30 precision for GMX
        uint256 sizeDeltaUsd = (initialCollateralDeltaAmount * acceptablePrice) * 1e12; // Adjusted for 30 decimals

        IBaseOrderUtils.CreateOrderParamsNumbers memory orderParamsNumbers = IBaseOrderUtils.CreateOrderParamsNumbers({
            sizeDeltaUsd: sizeDeltaUsd,
            initialCollateralDeltaAmount: initialCollateralDeltaAmount,
            triggerPrice: 0,
            acceptablePrice: acceptablePrice,
            executionFee: EXECUTION_FEE,
            callbackGasLimit: 3000000, 
            minOutputAmount: 0
        });

        IBaseOrderUtils.CreateOrderParams memory orderParams = IBaseOrderUtils.CreateOrderParams({
            addresses: defaultOrderParamsAddresses,
            numbers: orderParamsNumbers,
            orderType: Order.OrderType.MarketIncrease,
            decreasePositionSwapType: Order.DecreasePositionSwapType.NoSwap,
            isLong: false,
            shouldUnwrapNativeToken: false,
            referralCode: bytes32(0)
        });

        (key, orderAccount) = _hedge(msg.sender, orderParams);
    }

    function _hedge(
        address user,
        IBaseOrderUtils.CreateOrderParams memory orderParams
    ) internal returns (bytes32 key, address orderAccount) {
        uint256 totalFee = orderParams.numbers.initialCollateralDeltaAmount + EXECUTION_FEE;

        // Transfer funds to GMX Order Vault
        Router(GMX_ROUTER).sendWnt(ORDER_VAULT, totalFee); 

        // Call Exchange Router to createOrder
        key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = user;
        orderAccount = user;

        // Emit HedgeOpened event
        emit HedgeOpened(user, key, orderParams.numbers.sizeDeltaUsd);
    }
   





    function unHedge(
        uint256 amount, // shares out
        uint256 minimumOut // Eth returned
    ) external payable whenNotPaused returns (bytes32 key, address orderAccount) {      
        // Validate order params
     //   _validateOrderParams(amount, acceptablePrice);

        uint256 payableAmount = EXECUTION_FEE;
        require(msg.value >= payableAmount, "Insufficient execution fee");

        // Calculate price
        uint256 acceptablePrice = (amount / minimumOut); 

        //calculate size delta 
        uint256 sizeDeltaUsd = (acceptablePrice * amount) * 1e12;

        IBaseOrderUtils.CreateOrderParamsNumbers memory orderParamsNumbers = IBaseOrderUtils.CreateOrderParamsNumbers({
            sizeDeltaUsd: sizeDeltaUsd,
            initialCollateralDeltaAmount: minimumOut,
            triggerPrice: 0,
            acceptablePrice: acceptablePrice,
            executionFee: EXECUTION_FEE,
            callbackGasLimit: 3000000, 
            minOutputAmount: 0
        });

        IBaseOrderUtils.CreateOrderParams memory orderParams = IBaseOrderUtils.CreateOrderParams({
            addresses: defaultOrderParamsAddresses,
            numbers: orderParamsNumbers,
            orderType: Order.OrderType.MarketDecrease,
            decreasePositionSwapType: Order.DecreasePositionSwapType.NoSwap,
            isLong: false,
            shouldUnwrapNativeToken: false,
            referralCode: bytes32(0)
        });

        (key, orderAccount) = _unHedge(msg.sender, orderParams);
    }

    function _unHedge(
        address user,
        IBaseOrderUtils.CreateOrderParams memory orderParams
    ) internal returns (bytes32 key, address orderAccount) {
        uint256 totalFee = orderParams.numbers.executionFee; // executionFee covers all necessary costs

        // Transfer funds to GMX Order Vault
        Router(GMX_ROUTER).sendWnt{value: totalFee}(ORDER_VAULT, totalFee);

        // Call Exchange Router to createOrder
        key = Router(GMX_ROUTER).createOrder{value: totalFee}(orderParams);
        
        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = user;
        orderAccount = user;

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
        //require(roleStore.hasRole(msg.sender, GMX_CONTROLLER), "Invalid role");

        address _user = orders[key];
        // _removeOrder(key, _user);

        // Store a value from eventData into contract state
       // shares[_user] = eventData.someValue;

        // need to use event data to mint shares - update later
        if (order.numbers.orderType == Order.OrderType.MarketIncrease) {
            uint256 sharesToMint = usdToShares(order.numbers.sizeDeltaUsd);
            _mint(_user, sharesToMint);
        } else if (order.numbers.orderType == Order.OrderType.MarketDecrease) {
            uint256 sharesToBurn = usdToShares(order.numbers.sizeDeltaUsd);
            if (lockedShares[_user] >= sharesToBurn && balanceOf(_user) >= sharesToBurn) {
                // User has enough shares, proceed with burn and transfer
                _burn(_user, sharesToBurn);
                // Transfer WETH
              //  IERC20(WETH).safeTransfer(_user, order.numbers.initialCollateralDeltaAmount);
                lockedShares[_user] -= sharesToBurn;
            } else {
                // Hold WETH in contract and register shares error
                // Log this event for later reconciliation
                emit OrderExecuted(address(this), key, order.numbers.initialCollateralDeltaAmount);
            }
        } else {
            // Handle unexpected order types if necessary
            emit UnexpectedOrderType(key);
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
     //   require(roleStore.hasRole(msg.sender, GMX_CONTROLLER), "Invalid role");
        
        // Get user account
        address _user = orders[key];

        // Remove from account orders list
    //    _removeOrder(key, _user);

        // If increaseOrder (Hedge) then return collateral to depositor
        if (order.numbers.orderType == Order.OrderType.MarketIncrease) {
            // Transfer the collateral back to the order receiver
            IERC20(WETH).safeTransfer( _user, order.numbers.initialCollateralDeltaAmount);
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
      //  require(roleStore.hasRole(msg.sender, GMX_CONTROLLER), "Invalid role");
        
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
    function _validateOrderParams(uint256 amount, uint256 acceptablePrice) internal pure {
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
    function ownerPlaceOrder(IBaseOrderUtils.CreateOrderParams calldata orderParams, uint256 amount) external payable onlyOwner {
        // Transfer WETH from the owner to the GMX Order Vault
        IERC20(WETH).safeTransferFrom(msg.sender, ORDER_VAULT, amount);

        // Call Exchange Router to createOrder
        bytes32 key = Router(GMX_ROUTER).createOrder{value: msg.value}(orderParams);

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


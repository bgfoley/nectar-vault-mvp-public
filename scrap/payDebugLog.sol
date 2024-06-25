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
contract PaySmdgeDB is ERC20, Ownable, IOrderCallbackReceiver {
    using SafeERC20 for IERC20;

    event HedgeOpened(address indexed user, bytes32 key, uint256 sizeDeltaUsd);
    event HedgeClosed(address indexed user, bytes32 key, uint256 sizeDeltaUsd);
    event OrderExecuted(address indexed user, bytes32 key, uint256 collateralAmount);
    event OrderCancelled(address indexed user, bytes32 key, uint256 collateralAmount);
    event OrderFrozen(address indexed user, bytes32 key);

    // For debugging
    event UnexpectedOrderType(bytes32 key);
    event DebugLog(string message, uint256 value);
    event DebugAddress(string message, address value);
    event DebugBytes32(string message, bytes32 value);

    bool public paused;

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
    address public constant GMX_MARKET = 0x450bb6774Dd8a756274E0ab4107953259d2ac541;
    address public constant ROLESTORE_ADDRESS = 0x3c3d99FD298f679DBC2CEcd132b4eC4d0F5e6e72;
    address public constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
    address public immutable HEDGE_VAULT = address(this);
    bytes32 private constant GMX_CONTROLLER = 0x97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b;
    uint256 private constant EXECUTION_FEE = 114000000000000;

    /// @dev GMX rolestore 
    IRoleStore public roleStore;

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
            swapPath: new address [](0)  
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

    function calculatePriceFromEth(uint256 amount, uint256 minimumSharesOut) internal pure returns (uint256) {
        uint256 slippage = 1003; // 1003 represents 1.003 for a 0.3% slippage
        return (amount * slippage / 1000) / (minimumSharesOut) * 1e12;
    }

    function calculatePriceFromShares(uint256 amount, uint256 minimumOut) internal pure returns (uint256) {
        uint256 slippage = 1003; // 1003 represents 1.003 for a 0.3% slippage
        return ((amount * slippage / 1000) / minimumOut) * 1e12;
    }

    // Default slippage .003
    function hedge(
        uint256 amount,
        uint256 minimumSharesOut,
        uint256 acceptablePrice
    ) external payable whenNotPaused returns (bytes32 key, address orderAccount) {      
        uint256 initialCollateralDeltaAmount = amount;
        uint256 payableAmount = amount + EXECUTION_FEE;
        require(msg.value >= payableAmount, "Insufficient execution fee");

        uint256 sizeDeltaUsd = minimumSharesOut * 1e12;
        emit DebugLog("Hedge - sizeDeltaUsd", sizeDeltaUsd);
        emit DebugLog("Hedge - initialCollateralDeltaAmount", initialCollateralDeltaAmount);
        emit DebugLog("Hedge - acceptablePrice", acceptablePrice);
        
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

    function unHedge(
        uint256 amount, // shares out
        uint256 minimumOut, // Eth returned
        uint256 acceptablePrice
    ) external payable whenNotPaused returns (bytes32 key, address orderAccount) {      
        uint256 payableAmount = EXECUTION_FEE;
        require(msg.value >= payableAmount, "Insufficient execution fee");

        uint256 sizeDeltaUsd = amount * 1e12;
        emit DebugLog("UnHedge - sizeDeltaUsd", sizeDeltaUsd);
        emit DebugLog("UnHedge - minimumOut", minimumOut);
        emit DebugLog("UnHedge - acceptablePrice", acceptablePrice);

        IBaseOrderUtils.CreateOrderParamsNumbers memory orderParamsNumbers = IBaseOrderUtils.CreateOrderParamsNumbers({
            sizeDeltaUsd: sizeDeltaUsd,
            initialCollateralDeltaAmount: minimumOut,
            triggerPrice: 0,
            acceptablePrice: acceptablePrice,
            executionFee: EXECUTION_FEE,
            callbackGasLimit: 3000000,
            minOutputAmount: minimumOut
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

    function _hedge(
        address user,
        IBaseOrderUtils.CreateOrderParams memory orderParams
    ) internal returns (bytes32 key, address orderAccount) {
        uint256 totalFee = orderParams.numbers.initialCollateralDeltaAmount + EXECUTION_FEE;

        emit DebugLog("_hedge - totalFee", totalFee);
        emit DebugBytes32("_hedge - orderParams.key", key);

        // Transfer funds to GMX Order Vault
        Router(GMX_ROUTER).sendWnt{value: totalFee}(ORDER_VAULT, totalFee);

        // Call Exchange Router to createOrder
        key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = user;
        orderAccount = user;

        emit HedgeOpened(user, key, orderParams.numbers.sizeDeltaUsd);
    }

    function _unHedge(
        address user,
        IBaseOrderUtils.CreateOrderParams memory orderParams
    ) internal returns (bytes32 key, address orderAccount) {
        uint256 totalFee = orderParams.numbers.executionFee;

        emit DebugLog("_unHedge - totalFee", totalFee);
        emit DebugBytes32("_unHedge - orderParams.key", key);

        // Transfer funds to GMX Order Vault
        Router(GMX_ROUTER).sendWnt{value: totalFee}(ORDER_VAULT, totalFee);

        // Call Exchange Router to createOrder
        key = Router(GMX_ROUTER).createOrder{value: totalFee}(orderParams);

        // Update orders and accounts
        accountOrders[user].push(key);
        orders[key] = user;
        orderAccount = user;

        emit HedgeClosed(user, key, orderParams.numbers.sizeDeltaUsd);
    }

    function _removeOrder(bytes32 key, address user) internal {
        delete orders[key];
        bytes32[] storage _accountOrders = accountOrders[user];
        for (uint256 i = 0; i < _accountOrders.length; ) {
            if (_accountOrders[i] == key) {
                _accountOrders[i] = _accountOrders[_accountOrders.length - 1];
                _accountOrders.pop();
                break;
            }
            unchecked { i++; }
        }
    }

    function afterOrderExecution(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external override {
        address _user = orders[key];
        if (order.numbers.orderType == Order.OrderType.MarketIncrease) {
            uint256 sharesToMint = usdToShares(order.numbers.sizeDeltaUsd);
            _mint(_user, sharesToMint);
        } else if (order.numbers.orderType == Order.OrderType.MarketDecrease) {
            uint256 sharesToBurn = usdToShares(order.numbers.sizeDeltaUsd);
            if (lockedShares[_user] >= sharesToBurn && balanceOf(_user) >= sharesToBurn) {
                _burn(_user, sharesToBurn);
                lockedShares[_user] -= sharesToBurn;
            } else {
                emit OrderExecuted(address(this), key, order.numbers.initialCollateralDeltaAmount);
            }
        } else {
            emit UnexpectedOrderType(key);
        }

        emit OrderExecuted(_user, key, order.numbers.initialCollateralDeltaAmount);
    }

    function afterOrderCancellation(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external override {
        address _user = orders[key];
        if (order.numbers.orderType == Order.OrderType.MarketIncrease) {
            IERC20(WETH).safeTransfer(_user, order.numbers.initialCollateralDeltaAmount);
        } else if (order.numbers.orderType == Order.OrderType.MarketDecrease) {
            lockedShares[_user] -= order.numbers.sizeDeltaUsd;
        }
        emit OrderCancelled(_user, key, order.numbers.initialCollateralDeltaAmount);
    }

    function afterOrderFrozen(bytes32 key, Order.Props memory order, EventUtils.EventLogData memory eventData) external override {
        address _user = orders[key];
        emit OrderFrozen(_user, key);
        Router(GMX_ROUTER).cancelOrder(key);
    }

    function _validateOrderParams(uint256 amount, uint256 acceptablePrice) internal pure {
        require(amount > 0, "Invalid deposit amount");
        require(acceptablePrice > 0, "Invalid acceptable price");
    }

    function claimFundingFees() public onlyOwner returns (uint256[] memory) {
        address[] memory markets = new address[](2);
        address[] memory tokens = new address[](2);
        
        markets[0] = GMX_MARKET;
        markets[1] = GMX_MARKET;
        tokens[0] = WETH;
        tokens[1] = USDC;
        
        return Router(GMX_ROUTER).claimFundingFees(markets, tokens, HEDGE_VAULT);
    }
    
    function ownerPlaceOrder(IBaseOrderUtils.CreateOrderParams calldata orderParams, uint256 amount) external payable onlyOwner {
        IERC20(WETH).safeTransferFrom(msg.sender, ORDER_VAULT, amount);
        bytes32 key = Router(GMX_ROUTER).createOrder{value: msg.value}(orderParams);
        accountOrders[msg.sender].push(key);
        orders[key] = msg.sender;
        emit HedgeOpened(msg.sender, key, orderParams.numbers.sizeDeltaUsd);
    }

    function recoverStuckFunds(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to recover");
        IERC20(token).safeTransfer(owner(), balance);
    }
    
    function claimAccumulatedEth() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to claim");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }

    function mint(address to, uint256 shares) external onlyOwner {
        _mint(to, shares);
    }
}

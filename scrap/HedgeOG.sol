// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IOrderCallbackReceiver} from "./interfaces/IOrderCallbackReceiver.sol";


/// @dev Interface for GMX's Exchange Router
/// @notice Switch this out for an import
interface Router {
    function sendWnt(
        uint256 sendWnt,
        address receiver,
        uint256 amount
    ) external payable;
    function sendTokens(
        address token,
        address receiver,
        uint256 amount
    ) external payable;
    function createOrder(
        CreateOrderParams calldata params
    ) external returns (bytes32);
}

contract Hedge is NectarVault, IOrderCallbackReceiver {
    using SafeERC20 for IERC20;

    /// @notice createOrderParamsAddresses for GMX orders
    /// @param receiver is Hedge Vault
    /// @param callbackContract is Hedge Vault
    /// @param uiFeeReceiver 0x0
    /// @param market is GMX market_key address
    struct CreateOrderParamsAddresses {
        address receiver; // address(this)
        address callbackContract; // address(this)
        address uiFeeReceiver; // 0x0000000000000000000000000000000000000000
        address market; // 0x70d95587d40A2caf56bd97485aB3Eec10Bee6336
        address initialCollateralToken; //  WETH 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
        address[] swapPath;
    }

    /// @notice createOrderParamsNumbers for GMX orders
    /// @param sizeDeltaUsd is order size, calculated by UI
    /// @param initialCollateralDeltaAmount
    /// @param uiFeeReceiver 0x0
    /// @param market is GMX market_key address
    struct CreateOrderParamsNumbers {
        uint256 sizeDeltaUsd;
        uint256 initialCollateralDeltaAmount;
        uint256 triggerPrice;
        uint256 acceptablePrice;
        uint256 executionFee;
        uint256 callbackGasLimit;
        uint256 minOutputAmount;
    }

    enum OrderType {
        MarketSwap,
        LimitSwap,
        MarketIncrease,
        LimitIncrease,
        MarketDecrease,
        LimitDecrease,
        StopLossDecrease,
        Liquidation
    }

    enum DecreasePositionSwapType {
        NoSwap,
        SwapPnlTokenToCollateralToken,
        SwapCollateralTokenToPnlToken
    }

    struct CreateOrderParams {
        CreateOrderParamsAddresses addresses;
        CreateOrderParamsNumbers numbers;
        OrderType orderType;
        DecreasePositionSwapType decreasePositionSwapType;
        bool isLong;
        bool shouldUnwrapNativeToken;
        bytes32 referralCode;
    }

    event HedgeOpened(
        address indexed account,
        bytes32 orderKey,
        uint256 sizeDeltaUsd
    );
    event HedgeClosed(
        address indexed account,
        bytes32 orderKey,
        uint256 sizeDeltaUsd
    );
    event OrderExecuted(
        address indexed account,
        bytes32 orderKey,
        uint256 collateralAmount
    );
    event OrderCancelled(
        address indexed account,
        bytes32 orderKey,
        uint256 collateralAmount
    );

    // Mapping from orderKey to OrderInfo
    mapping(bytes32 => address) public orders;

    // Mapping from user address to list of orderKeys
    mapping(address => bytes32[]) public accountOrders;

    address public constant GMX_ROUTER = 0x7C68C7866A64FA2160F78EEaE12217FFbf871fa8;
    address public constant ORDER_VAULT = 0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5;
    address public constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;
    address public constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address public constant GMX_MARKET = 0x6853EA96FF216fAb11D2d930CE3C508556A4bdc4;
    address public constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
    address public constant HEDGE_VAULT = address(this);

    constructor() {}

    function hedge(
        uint256 amount,
        address account,
        CreateOrderParams orderParams
    ) external {
        require(amount > 0, "Invalid deposit amount");
        _validateOrderParams(orderParams);
        _hedge(amount, account, orderParams);
    }

    function _hedge(
        uint256 amount,
        address account,
        CreateOrderParams orderParams
    ) internal returns (uint256, address) {
        // Take Hedge fee logic here

        // Transfer funds to GMX Exchange Router
        IERC20(WETH).safeTransferFrom(account, ORDER_VAULT, amount);

        // Call Exchange Router to createOrder
        bytes32 key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[account].push(key);
        orders[key] = account;

        // Emit HedgeOpened event
        emit HedgeOpened(account, key, orderParams.numbers.sizeDeltaUsd);
    }

    function unHedge(uint256 shares, CreateOrderParams orderParams) external {
        // Check account's available shares
        require(balanceOf(msg.sender) >= shares, "Insufficient balance");

        _validateOrderParams(orderParams);

        // Transfer execution fee to orderVault
        IERC20(WETH).safeTransferFrom(
            account,
            ORDER_VAULT,
            orderParams.numbers.executionFee
        );

        // Call Exchange Router to transfer execution fee to order vault
        bytes32 key = Router(GMX_ROUTER).createOrder(orderParams);

        // Update orders and accounts
        accountOrders[account].push(key);
        orders[key] = msg.sender;

        // Emit HedgeClosed event
        emit HedgeClosed(msg.sender, key, orderParams.numbers.sizeDeltaUsd);
    }

    // Internal function to remove an order
    function _removeOrder(bytes32 key, address account) internal {
        delete orders[key];
        // Find and remove the key from the user's order list
        bytes32[] storage _accountOrders = accountOrders[account];
        for (uint256 i = 0; i < _accountOrders.length; i++) {
            if (_accountOrders[i] == key) {
                _accountOrders[i] = _accountOrders[_accountOrders.length - 1];
                _accountOrders.pop();
                break;
            }
        }
    }

    function afterOrderExecution(
        bytes32 key,
        Order.props memory order,
        EventUtils.EventLogData memory eventData
    ) external override {
        
        // Get account
        address _account = orders[key];

        // Remove from account orders list
        _removeOrder(key, _account);

        // If increaseOrder (Hedge) then mint shares
        if (order.orderType == 2) {
            
            // Mint shares
            _mint(_account, order.numbers.sizeDeltaUsd);

        // If decreaseOrder (unHedge) initiate withdrawal
        } else if (order.orderType == 3) {

            // burn shares and withdraw collateral
            _burn(_account, order.numbers.sizeDeltaUsd);
            IERC20(WETH).safeTransferFrom(ORDER_VAULT, _account, order.numbers.initialCollateralDeltaAmount);
        }

        emit OrderExecuted(_account, key, order.numbers.initialCollateralDeltaAmount);
    }

    // @dev called after an order cancellation
    function afterOrderCancellation(
        bytes32 key,
        Order.Props memory order,
        EventUtils.EventLogData memory eventData
    ) external override {


        // Get account
        address _account = orders[key];

        // Remove from account orders list
        _removeOrder(key, _account);

        // If increaseOrder (Hedge) then return collateral to depositor
        if (order.orderType == 2) {
        
            // Transfer the collateral back to the order receiver
            IERC20(WETH).transferFrom(ORDER_VAULT, _account, order.numbers.initialCollateralDeltaAmount);
        }
        
        // If decreaseOrder (unHedge), there is nothing to return
    
        // Emit order cancelled event
        emit OrderCancelled(_account, key, collateralAmount);
    }

    function _mint(
        uint256 shares,
        address receiver
    ) internal override returns (uint256) {
     

        // Mint shares
        _mint(receiver, shares);

        // Update vault assetts

        return shares;
    }

    // Function to verify validity of order parameters for Hedge contract
    function _validateOrderParams(
        CreateOrderParams memory params,
        uint256 amount
    ) internal view {
        // Validate addresses
        require(
            params.addresses.receiver == HEDGE_VAULT,
            "Invalid receiver address"
        );
        require(
            params.addresses.callbackContract == HEDGE_VAULT,
            "Invalid callback contract address"
        );
        require(
            params.addresses.uiFeeReceiver == ZERO_ADDRESS,
            "Invalid UI fee receiver address"
        );
        require(
            params.addresses.market == GMX_MARKET,
            "Invalid market address"
        );
        require(
            params.addresses.initialCollateralToken == WETH,
            "Invalid initial collateral token"
        );

        // Validate order type
        if (params.orderType == OrderType.MarketIncrease) {
            // Validate numbers for deposits
            require(
                params.numbers.sizeDeltaUsd ==
                    (params.numbers.initialCollateralDeltaAmount *
                        params.numbers.acceptablePrice) /
                        1e18,
                "Invalid sizeDeltaUsd"
            );
            require(
                params.numbers.initialCollateralDeltaAmount +
                    params.numbers.executionFee ==
                    amount,
                "Invalid collateral delta and execution fee"
            );
        } else if (params.orderType == OrderType.MarketDecrease) {
            // Additional checks for withdrawals can be implemented here
            // Validate numbers for deposits
            require(
                params.numbers.sizeDeltaUsd ==
                    (params.numbers.initialCollateralDeltaAmount *
                        params.numbers.acceptablePrice) /
                        1e18,
                "Invalid sizeDeltaUsd"
            );
            require(
                params.numbers.initialCollateralDeltaAmount +
                    params.numbers.executionFee ==
                    amount,
                "Invalid collateral delta and execution fee"
            );
        } else {
            revert("Invalid order type");
        }

        // Validate boolean flags
        require(params.isLong == false, "Order must be short");
        require(
            params.shouldUnwrapNativeToken == true,
            "Order must unwrap native token"
        );
    }
}

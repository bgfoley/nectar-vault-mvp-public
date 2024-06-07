// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IOrderCallbackReceiver} from "./interfaces/IOrderCallbackReceiver.sol";
import {Router} from "./interfaces/Router.sol";
import {CreateOrderParams, CreateOrderParamsAddresses, CreateOrderParamsNumbers, OrderType, DecreasePositionSwapType} from "./interfaces/CreateOrderParams.sol";

contract Hedge is ERC20, IOrderCallbackReceiver {
    using SafeERC20 for IERC20;
    using Order for Props;

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

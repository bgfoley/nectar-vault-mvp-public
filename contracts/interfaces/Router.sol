// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./IBaseOrderUtils.sol";
import "../lib/Order.sol";

/// @dev Interface for GMX's Exchange Router
interface Router is IBaseOrderUtils {
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

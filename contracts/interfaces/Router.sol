// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @dev Interface for GMX's Exchange Router 
/// @notice Switch this out for an import
interface Router {
    function sendWnt(uint256 sendWnt, address receiver, uint256 amount) external payable;
    function sendTokens(address token, address receiver, uint256 amount) external payable;
    function createOrder(CreateOrderParams calldata params) external returns (bytes32);
}
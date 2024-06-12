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

    function cancelOrder(bytes32 key) external;

        /**
     * @dev Claims funding fees for the given markets and tokens on behalf of the caller, and sends the
     * fees to the specified receiver.
     * 
     * @param markets An array of market addresses.
     * @param tokens An array of token addresses, corresponding to the given markets.
     * @param receiver The address to which the claimed fees should be sent.
     * @return An array of claimed amounts for each market.
     */
    function claimFundingFees(
        address[] memory markets,
        address[] memory tokens,
        address receiver
        ) external payable returns (uint256[] memory);

}

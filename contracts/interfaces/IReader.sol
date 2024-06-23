// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../lib/Position.sol";
import "../lib/Order.sol";

/// @dev Interface for GMX's Reader contract
interface IReader {
    function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) external view returns (Position.Props[] memory);

     function getOrder(address dataStore, bytes32 key) external view returns (Order.Props memory);
}
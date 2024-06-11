// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
interface IReader {
    function getMarket(address dataStore, address key) external view returns (Market.Props memory);
    function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) external view returns (Position.Props[] memory);
}
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
interface IDataStore {
    function get(address key) external view returns (uint256);
}
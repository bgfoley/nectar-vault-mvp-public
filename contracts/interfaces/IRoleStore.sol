// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
interface IRoleStore {
    function hasRole(address account, bytes32 role) external view returns (bool);
}
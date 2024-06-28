// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {IRoleStore} from "./interfaces/IRoleStore.sol";
import {IReader} from "./interfaces/IReader.sol";
import {IDataStore} from "./interfaces/IDataStore.sol";
import {Position} from "./lib/Position.sol";
import {Order} from "./lib/Order.sol";

contract DataReader {

    address public constant READER_ADDRESS = 0x22199a49A999c351eF7927602CFB187ec3cae489;
    address public constant DATASTORE_ADDRESS = 0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8;

    /// @dev GMX reader contract 
    IReader public reader;
    /// @dev GMX datastore
    IDataStore public dataStore;

    constructor(){
         reader = IReader(READER_ADDRESS);
        dataStore = IDataStore(DATASTORE_ADDRESS);
    }

     /**
     * @notice Get order props for a pending order
     * @param key is the order key
     * @return Array of Order.Props with the user's order details
     */
    function getOrderDetails(bytes32 key) external view returns (Order.Props memory) {
        return reader.getOrder(address(dataStore), key);
    }

    /**
     * @notice Get the size of the short position held by the contract
     * @return The size of the short position in USD
     */
    function getPositionSizeUsd(address strategy) external view returns (uint256) {
        Position.Props[] memory positions = reader.getAccountPositions(address(dataStore), strategy, 0, 1);
        if (positions.length > 0 && !Position.isLong(positions[0])) {
            return Position.sizeInUsd(positions[0]);
        }
        return 0;
    }

    /**
     * @notice Get the size of the short position held by the contract
     * @return The size of the short position in tokens
     */
    function getPositionSizeTokens(address strategy) external view returns (uint256) {
        Position.Props[] memory positions = reader.getAccountPositions(address(dataStore), strategy, 0, 1);
        if (positions.length > 0 && !Position.isLong(positions[0])) {
            return Position.sizeInTokens(positions[0]);
        }
        return 0;
    }

    /**
     * @notice Get the size of the short position held by the contract
     * @return The size of the short position in USD
     */
    function getCollateralAmount(address strategy) external view returns (uint256) {
        Position.Props[] memory positions = reader.getAccountPositions(address(dataStore), strategy, 0, 1);
        if (positions.length > 0 && !Position.isLong(positions[0])) {
            return Position.collateralAmount(positions[0]);
        }
        return 0;
    }

}


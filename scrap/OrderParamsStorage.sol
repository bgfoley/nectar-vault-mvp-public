// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import nectar access control

contract OrderStorage {
    
    event OrderAdded(uint256 index, CreateOrderParams order);
    event OrderReplaced(uint256 index, CreateOrderParams order);
    
    // Define the nested structs and enums
    struct CreateOrderParamsAddresses {
        address receiver;
        address callbackContract;
        address uiFeeReceiver;
        address market;
        address initialCollateralToken;
        address[] swapPath;
    }

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

    // Define the array to store the structs
    CreateOrderParams[] public orderParams;

    address public immutable governance;

    constructor(address _governance) {
        governance = _governance;
    }

    // Function to add a new order params to the array
    /// @dev add modifier for governance access 
    function addStrategyParams(
        CreateOrderParamsAddresses calldata addresses,
        CreateOrderParamsNumbers calldata numbers,
        OrderType orderType,
        DecreasePositionSwapType decreasePositionSwapType,
        bool isLong,
        bool shouldUnwrapNativeToken,
        bytes32 referralCode
    ) external {
        // Add the new order to the array
        orderParams.push(CreateOrderParams({
            addresses: addresses,
            numbers: numbers,
            orderType: orderType,
            decreasePositionSwapType: decreasePositionSwapType,
            isLong: isLong,
            shouldUnwrapNativeToken: shouldUnwrapNativeToken,
            referralCode: referralCode
        }));
    }

     // Function to replace an order by index
    function replaceStrategyParams(
        uint256 index,
        CreateOrderParamsAddresses calldata addresses,
        CreateOrderParamsNumbers calldata numbers,
        OrderType orderType,
        DecreasePositionSwapType decreasePositionSwapType,
        bool isLong,
        bool shouldUnwrapNativeToken,
        bytes32 referralCode
    ) external {
        require(index < orderParams.length, "Order index out of bounds");

        // Replace the order at the specified index
        orderParams[index] = CreateOrderParams({
            addresses: addresses,
            numbers: numbers,
            orderType: orderType,
            decreasePositionSwapType: decreasePositionSwapType,
            isLong: isLong,
            shouldUnwrapNativeToken: shouldUnwrapNativeToken,
            referralCode: referralCode
        });
    }

    // Function to get an order by index
    function getStrategyOrderParams(uint256 index) external view returns (CreateOrderParams memory) {
        require(index < orderParams.length, "Order index out of bounds");
        return orderParams[index];
    }
}

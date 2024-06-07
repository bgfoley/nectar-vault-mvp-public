// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/// @notice createOrderParamsAddresses for GMX orders
/// @param receiver is Hedge Vault
/// @param callbackContract is Hedge Vault
/// @param uiFeeReceiver 0x0
/// @param market is GMX market_key address
struct CreateOrderParamsAddresses {
    address receiver; // address(this)
    address callbackContract; // address(this)
    address uiFeeReceiver; // 0x0000000000000000000000000000000000000000
    address market; // 0x70d95587d40A2caf56bd97485aB3Eec10Bee6336
    address initialCollateralToken; // WETH 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1
    address[] swapPath;
}

/// @notice createOrderParamsNumbers for GMX orders
/// @param sizeDeltaUsd is order size, calculated by UI
/// @param initialCollateralDeltaAmount
/// @param triggerPrice
/// @param acceptablePrice
/// @param executionFee
/// @param callbackGasLimit
/// @param minOutputAmount
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

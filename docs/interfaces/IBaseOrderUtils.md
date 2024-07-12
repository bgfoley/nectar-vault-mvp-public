# Solidity API

## IBaseOrderUtils

### CreateOrderParams

```solidity
struct CreateOrderParams {
  struct IBaseOrderUtils.CreateOrderParamsAddresses addresses;
  struct IBaseOrderUtils.CreateOrderParamsNumbers numbers;
  enum Order.OrderType orderType;
  enum Order.DecreasePositionSwapType decreasePositionSwapType;
  bool isLong;
  bool shouldUnwrapNativeToken;
  bytes32 referralCode;
}
```

### CreateOrderParamsAddresses

```solidity
struct CreateOrderParamsAddresses {
  address receiver;
  address callbackContract;
  address uiFeeReceiver;
  address market;
  address initialCollateralToken;
  address[] swapPath;
}
```

### CreateOrderParamsNumbers

```solidity
struct CreateOrderParamsNumbers {
  uint256 sizeDeltaUsd;
  uint256 initialCollateralDeltaAmount;
  uint256 triggerPrice;
  uint256 acceptablePrice;
  uint256 executionFee;
  uint256 callbackGasLimit;
  uint256 minOutputAmount;
}
```


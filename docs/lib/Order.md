# Solidity API

## Order

### OrderType

```solidity
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
```

### SecondaryOrderType

```solidity
enum SecondaryOrderType {
  None,
  Adl
}
```

### DecreasePositionSwapType

```solidity
enum DecreasePositionSwapType {
  NoSwap,
  SwapPnlTokenToCollateralToken,
  SwapCollateralTokenToPnlToken
}
```

### Props

```solidity
struct Props {
  struct Order.Addresses addresses;
  struct Order.Numbers numbers;
  struct Order.Flags flags;
}
```

### Addresses

```solidity
struct Addresses {
  address account;
  address receiver;
  address callbackContract;
  address uiFeeReceiver;
  address market;
  address initialCollateralToken;
  address[] swapPath;
}
```

### Numbers

```solidity
struct Numbers {
  enum Order.OrderType orderType;
  enum Order.DecreasePositionSwapType decreasePositionSwapType;
  uint256 sizeDeltaUsd;
  uint256 initialCollateralDeltaAmount;
  uint256 triggerPrice;
  uint256 acceptablePrice;
  uint256 executionFee;
  uint256 callbackGasLimit;
  uint256 minOutputAmount;
  uint256 updatedAtBlock;
}
```

### Flags

```solidity
struct Flags {
  bool isLong;
  bool shouldUnwrapNativeToken;
  bool isFrozen;
}
```


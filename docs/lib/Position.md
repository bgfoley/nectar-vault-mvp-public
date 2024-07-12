# Solidity API

## Position

### Props

```solidity
struct Props {
  struct Position.Addresses addresses;
  struct Position.Numbers numbers;
  struct Position.Flags flags;
}
```

### Addresses

```solidity
struct Addresses {
  address account;
  address market;
  address collateralToken;
}
```

### Numbers

```solidity
struct Numbers {
  uint256 sizeInUsd;
  uint256 sizeInTokens;
  uint256 collateralAmount;
  uint256 borrowingFactor;
  uint256 fundingFeeAmountPerSize;
  uint256 longTokenClaimableFundingAmountPerSize;
  uint256 shortTokenClaimableFundingAmountPerSize;
  uint256 increasedAtBlock;
  uint256 decreasedAtBlock;
}
```

### Flags

```solidity
struct Flags {
  bool isLong;
}
```

### account

```solidity
function account(struct Position.Props props) internal pure returns (address)
```

### setAccount

```solidity
function setAccount(struct Position.Props props, address value) internal pure
```

### market

```solidity
function market(struct Position.Props props) internal pure returns (address)
```

### setMarket

```solidity
function setMarket(struct Position.Props props, address value) internal pure
```

### collateralToken

```solidity
function collateralToken(struct Position.Props props) internal pure returns (address)
```

### setCollateralToken

```solidity
function setCollateralToken(struct Position.Props props, address value) internal pure
```

### sizeInUsd

```solidity
function sizeInUsd(struct Position.Props props) internal pure returns (uint256)
```

### setSizeInUsd

```solidity
function setSizeInUsd(struct Position.Props props, uint256 value) internal pure
```

### sizeInTokens

```solidity
function sizeInTokens(struct Position.Props props) internal pure returns (uint256)
```

### setSizeInTokens

```solidity
function setSizeInTokens(struct Position.Props props, uint256 value) internal pure
```

### collateralAmount

```solidity
function collateralAmount(struct Position.Props props) internal pure returns (uint256)
```

### setCollateralAmount

```solidity
function setCollateralAmount(struct Position.Props props, uint256 value) internal pure
```

### borrowingFactor

```solidity
function borrowingFactor(struct Position.Props props) internal pure returns (uint256)
```

### setBorrowingFactor

```solidity
function setBorrowingFactor(struct Position.Props props, uint256 value) internal pure
```

### fundingFeeAmountPerSize

```solidity
function fundingFeeAmountPerSize(struct Position.Props props) internal pure returns (uint256)
```

### setFundingFeeAmountPerSize

```solidity
function setFundingFeeAmountPerSize(struct Position.Props props, uint256 value) internal pure
```

### longTokenClaimableFundingAmountPerSize

```solidity
function longTokenClaimableFundingAmountPerSize(struct Position.Props props) internal pure returns (uint256)
```

### setLongTokenClaimableFundingAmountPerSize

```solidity
function setLongTokenClaimableFundingAmountPerSize(struct Position.Props props, uint256 value) internal pure
```

### shortTokenClaimableFundingAmountPerSize

```solidity
function shortTokenClaimableFundingAmountPerSize(struct Position.Props props) internal pure returns (uint256)
```

### setShortTokenClaimableFundingAmountPerSize

```solidity
function setShortTokenClaimableFundingAmountPerSize(struct Position.Props props, uint256 value) internal pure
```

### increasedAtBlock

```solidity
function increasedAtBlock(struct Position.Props props) internal pure returns (uint256)
```

### setIncreasedAtBlock

```solidity
function setIncreasedAtBlock(struct Position.Props props, uint256 value) internal pure
```

### decreasedAtBlock

```solidity
function decreasedAtBlock(struct Position.Props props) internal pure returns (uint256)
```

### setDecreasedAtBlock

```solidity
function setDecreasedAtBlock(struct Position.Props props, uint256 value) internal pure
```

### isLong

```solidity
function isLong(struct Position.Props props) internal pure returns (bool)
```

### setIsLong

```solidity
function setIsLong(struct Position.Props props, bool value) internal pure
```


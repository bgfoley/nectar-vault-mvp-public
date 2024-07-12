# Solidity API

## DataReader

### READER_ADDRESS

```solidity
address READER_ADDRESS
```

### DATASTORE_ADDRESS

```solidity
address DATASTORE_ADDRESS
```

### reader

```solidity
contract IReader reader
```

_GMX reader contract_

### dataStore

```solidity
contract IDataStore dataStore
```

_GMX datastore_

### constructor

```solidity
constructor() public
```

### getOrderDetails

```solidity
function getOrderDetails(bytes32 key) external view returns (struct Order.Props)
```

Get order props for a pending order

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | is the order key |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Order.Props | Array of Order.Props with the user's order details |

### getPositionSizeUsd

```solidity
function getPositionSizeUsd(address strategy) external view returns (uint256)
```

Get the size of the short position held by the contract

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The size of the short position in USD |

### getPositionSizeTokens

```solidity
function getPositionSizeTokens(address strategy) external view returns (uint256)
```

Get the size of the short position held by the contract

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The size of the short position in tokens |

### getCollateralAmount

```solidity
function getCollateralAmount(address strategy) external view returns (uint256)
```

Get the size of the short position held by the contract

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The size of the short position in USD |


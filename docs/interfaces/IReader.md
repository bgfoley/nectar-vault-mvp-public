# Solidity API

## IReader

_Interface for GMX's Reader contract_

### getAccountPositions

```solidity
function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) external view returns (struct Position.Props[])
```

### getOrder

```solidity
function getOrder(address dataStore, bytes32 key) external view returns (struct Order.Props)
```


# Solidity API

## IOrderCallbackReceiver

### afterOrderExecution

```solidity
function afterOrderExecution(bytes32 key, struct Order.Props order, struct EventUtils.EventLogData eventData) external
```

### afterOrderCancellation

```solidity
function afterOrderCancellation(bytes32 key, struct Order.Props order, struct EventUtils.EventLogData eventData) external
```

### afterOrderFrozen

```solidity
function afterOrderFrozen(bytes32 key, struct Order.Props order, struct EventUtils.EventLogData eventData) external
```


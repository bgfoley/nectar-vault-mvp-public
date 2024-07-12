# Solidity API

## Router

_Interface for GMX's Exchange Router_

### sendWnt

```solidity
function sendWnt(address receiver, uint256 amount) external payable
```

### sendTokens

```solidity
function sendTokens(address token, address receiver, uint256 amount) external payable
```

### createOrder

```solidity
function createOrder(struct IBaseOrderUtils.CreateOrderParams params) external payable returns (bytes32)
```

### cancelOrder

```solidity
function cancelOrder(bytes32 key) external
```

### claimFundingFees

```solidity
function claimFundingFees(address[] markets, address[] tokens, address receiver) external payable returns (uint256[])
```

_Claims funding fees for the given markets and tokens on behalf of the caller, and sends the
fees to the specified receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| markets | address[] | An array of market addresses. |
| tokens | address[] | An array of token addresses, corresponding to the given markets. |
| receiver | address | The address to which the claimed fees should be sent. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of claimed amounts for each market. |


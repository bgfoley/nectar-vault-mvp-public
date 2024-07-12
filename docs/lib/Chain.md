# Solidity API

## Chain

### ARBITRUM_CHAIN_ID

```solidity
uint256 ARBITRUM_CHAIN_ID
```

### ARBITRUM_SEPOLIA_CHAIN_ID

```solidity
uint256 ARBITRUM_SEPOLIA_CHAIN_ID
```

### arbSys

```solidity
contract ArbSys arbSys
```

### currentTimestamp

```solidity
function currentTimestamp() internal view returns (uint256)
```

### currentBlockNumber

```solidity
function currentBlockNumber() internal view returns (uint256)
```

### getBlockHash

```solidity
function getBlockHash(uint256 blockNumber) internal view returns (bytes32)
```

### shouldUseArbSysValues

```solidity
function shouldUseArbSysValues() internal view returns (bool)
```


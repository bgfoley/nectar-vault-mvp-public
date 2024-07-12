# Solidity API

## IWETH

### deposit

```solidity
function deposit() external payable
```

### withdraw

```solidity
function withdraw(uint256 amount) external
```

### transfer

```solidity
function transfer(address to, uint256 value) external returns (bool)
```

### approve

```solidity
function approve(address spender, uint256 value) external returns (bool)
```

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 value) external returns (bool)
```

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```

### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```

### Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```


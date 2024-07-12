# Nectar Smart Contracts

# Overview

Nectar offers a suite of tokenized strategy vaults integrated with perpetuals dexs, designed to provide streamlined access to yield-generating trading stragies through a simple UI. Vaults feature modular architecture to allow for the expansion of our product suite to new strategies and exchanges. While our initial product offering will be governed by the founding team, Nectar is designed to allow for decentralized governance.This repo contains an overview of our architecture and the code-base for our flagship product, Hedge. 

## MVP

This repo contains work in progress, not recommended for production deployment. Its purpose is to demonstrate the basic functionality of Nectar's Hedge product and to serve as prototype for the platform's architecture.

## Definitions

- **Vault:** An ERC-4626 compliant contract that accepts user deposits, mints shares reflecting the user's stake in the vault, and allocates assets to various strategies to generate yield.
- **Strategy:** A contract that executes trades using the underlying assets of a given vault.

## Hedge

Hedge is a strategy vault that allows users to deposit assets such as ETH and wBTC to establish a delta-neutral position on GMX V2. Vault participants receive yield from the funding fees paid out through the perp dex, while ensuring minimal exposure to market volatility. Users receive shares representing the USD value of their position, which can be used as collateral to mint necUSD, a stablecoin. 

_This contract interacts with GMX's Exchange Router and Order Callback Receiver._


## State Variables

### User Data

Users deposit assets into the strategy contract, which executes trades on GMX. User orders and account data is stored in the strategy contract. Order execution within the perp-dex level is confirmed within 5-20 blocks of the order being placed. The storage writes to the strategy ensure the proper accounting of user assets between order creation and order execution. 

- **Note:** User data should be condensed to a single struct for Hedge's production model. 

### orders

```solidity
mapping(bytes32 => address) orders
```

_Mapping from key to OrderInfo_

GMX's createOrder function returns a bytes32 order key which is mapped to the user's address for easy retrieval once order is executed, frozen or cancelled.

### accountOrders

```solidity
mapping(address => bytes32[]) accountOrders
```

_Mapping from user address to list of orderKeys_

An array of order keys for each user account.

### lockedShares

```solidity
mapping(address => uint256) lockedShares
```

_Mapping from user address to locked shares_

When a user places an order to withdraw their assets, their shares are locked until the order is executed.

### wethBalance

```solidity
mapping(address => uint256) wethBalance
```

_account balance of WETH stored in contract_

After a withdrawal order is executed on GMX, asset are returned to the strategy contract. The amount of assets owed to the owner of the order key is accounted for here until it is retrieved by the user.

NOTE: In production consider replacing this step with a safe transfer directly to the user.

### sharesToBurn

```solidity
mapping(address => uint256) sharesToBurn
```

_account balance of locked shares that are ready to burn in exchange for WETH_

After a withdrawal order is executed on GMX and assets are returned to the strategy contract, the number of shares to burn is stored and should correspond with the the user's locked shares.

- **Note:** In production consider replacing this step by burning shares automatically when underlying assets are returned to user.

### Exchange Data

Exchange related variables and addresses pertaining to strategy execution.

### GMX_ROUTER

```solidity
address GMX_ROUTER
```
GMX Exchange Router contract is used to create and cancel orders.

_hardcoded constants are used for simplicity. In production, strategy contracts will 
    follow a reusable template without preassigned values_

### ORDER_VAULT

```solidity
address ORDER_VAULT
```

GMX Order Vault receives assets deposited for each order, along with execution fee and order details. Orders are picked up from the vault and executed by keepers.

### USDC

```solidity
address USDC
```

USDC is not the underlying asset of this vault, however most funding fees are paid from the strategy are paid in USDC and collected by the Hedge contract.

### WETH

```solidity
address WETH
```

WETH is the underlying asset for the HEDGE MVP. 

### GMX_MARKET

```solidity
address GMX_MARKET
```

The GMX Market address for strategy execution. For the HEDGE MVP it is the WETH Market, where WETH is both the collateral and underlying asset.

### ROLESTORE_ADDRESS

```solidity
address ROLESTORE_ADDRESS
```

The GMX Rolestore contains authorized addresses for exchange related access control. The rolestore is used to determine authorized caller origin for the strategy's afterOrder functions.

### ZERO_ADDRESS

```solidity
address ZERO_ADDRESS
```

### HEDGE_VAULT

```solidity
address HEDGE_VAULT
```
- **Note:** In production, vault and strategy will be seperate contracts. Strategy will command mint/burn authority over vault.

## Interfaces

### roleStore

```solidity
contract IRoleStore roleStore
```

_GMX rolestore interface to verify the origin of afterOrder-function calls_

### defaultOrderParamsAddresses

```solidity
struct IBaseOrderUtils.CreateOrderParamsAddresses defaultOrderParamsAddresses
```

_default address parameters for Hedge orders_

Strategy specific fixed order parameters.

## Modifiers

### whenNotPaused

```solidity
modifier whenNotPaused()
```

Ensures that the contract is not paused. 

## Functions

### constructor

```solidity
constructor() public
```

Constructs the Hedge contract

_Sets the ERC20 token details and initializes Ownable_

### _usdToShares

```solidity
function _usdToShares(uint256 usdAmount) internal pure returns (uint256)
```

Converts USD value in 1e30 to vault shares in 1e18

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| usdAmount | uint256 | The USD value to be converted, denominated in 1e30 |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The equivalent amount of vault shares, denominated in 1e18 |

### _sharesToUsd

```solidity
function _sharesToUsd(uint256 shares) internal pure returns (uint256)
```

Converts vault shares in 1e18 to USD value in 1e30

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The amount of vault shares to be converted, denominated in 1e18 |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The equivalent USD value, denominated in 1e30 |

### _validateOrderParams

```solidity
function _validateOrderParams(uint256 amount, uint256 acceptablePrice) internal pure
```

Internal function to validate order parameters

_This function ensures the amount and acceptable price are valid_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount associated with the order |
| acceptablePrice | uint256 | The acceptable price for the order |

### receive

```solidity
receive() external payable
```

### initialize

```solidity
function initialize() external
```

Initializes default order parameter data.

- **Note:** Use constructor for this in production

_This function must be called after deployment 
Reconfigure this as constructor for production deployment_

### initializeCustom

```solidity
function initializeCustom(address _roleStore, address _receiver, address _callbackContract, address _uiFeeReceiver, address _market, address _initialCollateralToken, address[] _swapPath) external
```

Resets default order parameters

_This function is for testing --  do not include in production_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _roleStore | address | The address of the role store contract |
| _receiver | address | The address to receive the orders |
| _callbackContract | address | The address of the callback contract |
| _uiFeeReceiver | address | The address to receive UI fees |
| _market | address | The address of the GMX market |
| _initialCollateralToken | address | The address of the initial collateral token |
| _swapPath | address[] | The array of addresses for the swap path |

### togglePause

```solidity
function togglePause() external
```

Toggles the pause state of the contract

_This function allows the owner to pause/unpause the contract
     EMERGENCY USE ONLY_

### hedge

```solidity
function hedge(uint256 amount, uint256 shares, uint256 price) external payable returns (bytes32 key, address orderAccount)
```

Creates an order to open a hedge position. Users deposit ETH along with order parameters. Message value should be equal to deposit amount plus the execution fee.

- **Note:** Must include optionality to deposit ETH or WETH in production.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of ETH to hedge |
| shares | uint256 | The amount of shares (USD value) to receive |
| price | uint256 | The acceptable price |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The key of the created order |
| orderAccount | address | The account associated with the order |

### _hedge

```solidity
function _hedge(address user, struct IBaseOrderUtils.CreateOrderParams orderParams) internal returns (bytes32 key, address orderAccount)
```

Internal function to open a hedge position

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user |
| orderParams | struct IBaseOrderUtils.CreateOrderParams | The parameters of the order |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The key of the created order |
| orderAccount | address | The account associated with the order |

### unHedge

```solidity
function unHedge(uint256 shares, uint256 amount, uint256 price) external payable returns (bytes32 key, address orderAccount)
```

Creates order to close a hedge position. User returns shares to strategy contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The amount of shares to return |
| amount | uint256 | The amount of ETH to receive |
| price | uint256 | The acceptable price |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The key of the created order |
| orderAccount | address | The account associated with the order |

### _unHedge

```solidity
function _unHedge(address user, struct IBaseOrderUtils.CreateOrderParams orderParams) internal returns (bytes32 key, address orderAccount)
```

Internal function to close a hedge position

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user |
| orderParams | struct IBaseOrderUtils.CreateOrderParams | The parameters of the order |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The key of the created order |
| orderAccount | address | The account associated with the order |

### afterOrderExecution

```solidity
function afterOrderExecution(bytes32 key, struct Order.Props order, struct EventUtils.EventLogData eventData) external
```

Callback function called by GMX after order execution. This function handles incoming and outgoing orders to the strategy, mints/burns shares and updates account data.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The unique identifier of the executed order |
| order | struct Order.Props | The properties of the executed order |
| eventData | struct EventUtils.EventLogData | Additional event data |

### afterOrderCancellation

```solidity
function afterOrderCancellation(bytes32 key, struct Order.Props order, struct EventUtils.EventLogData eventData) external
```

Callback function called after order cancellation. Returns assets to user.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The unique identifier of the cancelled order |
| order | struct Order.Props | The properties of the cancelled order |
| eventData | struct EventUtils.EventLogData | Additional event data |

### afterOrderFrozen

```solidity
function afterOrderFrozen(bytes32 key, struct Order.Props order, struct EventUtils.EventLogData eventData) external
```

Callback function called after an order has been frozen. This function cancels the frozen order.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| key | bytes32 | The unique identifier of the frozen order |
| order | struct Order.Props | The properties of the frozen order |
| eventData | struct EventUtils.EventLogData | Additional event data |

### settleAccount

```solidity
function settleAccount() external
```

Settles the user's account by withdrawing WETH and burning shares. 

### claimFundingFees

```solidity
function claimFundingFees() public returns (uint256[])
```

Owner only function to claim funding fees from the GMX Market.

#### Note

GMX Market will return USDC. USDC will be swapped for WETH and added to strategy vault.

_This function can only be called by the owner and claims fees for WETH and USDC tokens_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of funding fees claimed for each token |

### Functions for Testing Only

These are convenience functions used in the development and testing of the contracts, and will be removed at production.

### ownerPlaceOrder

```solidity
function ownerPlaceOrder(struct IBaseOrderUtils.CreateOrderParams orderParams) external payable
```

Places an order on behalf of the owner

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| orderParams | struct IBaseOrderUtils.CreateOrderParams | The parameters of the order |

### recoverStuckFunds

```solidity
function recoverStuckFunds(address token) external
```

Recovers any stuck funds in the contract

_This function can only be called by the owner_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token to recover |

### claimAccumulatedEth

```solidity
function claimAccumulatedEth() external
```

Claims any ETH that has accumulated in the contract

_This function can only be called by the owner_

### mint

```solidity
function mint(address to, uint256 shares) external
```

Mints shares to a specified address

_For testing purposes only_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The address to receive the shares |
| shares | uint256 | The amount of shares to mint |

### burn

```solidity
function burn(address from, uint256 shares) external
```

Burns shares from a specified address

_For testing purposes only_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| from | address | The address to burn the shares from |
| shares | uint256 | The amount of shares to burn |

### Events

### HedgeOpened

```solidity
event HedgeOpened(address user, bytes32 key, uint256 sizeDeltaUsd)
```

### HedgeClosed

```solidity
event HedgeClosed(address user, bytes32 key, uint256 sizeDeltaUsd)
```

### OrderExecuted

```solidity
event OrderExecuted(address user, bytes32 key, uint256 collateralAmount)
```

### OrderCancelled

```solidity
event OrderCancelled(address user, bytes32 key, uint256 collateralAmount)
```

### OrderFrozen

```solidity
event OrderFrozen(address user, bytes32 key)
```

### WethWithdrawn

```solidity
event WethWithdrawn(address user, uint256 amount)
```

### SharesBurned

```solidity
event SharesBurned(address user, uint256 amount)
```

### UnexpectedOrderType

```solidity
event UnexpectedOrderType(bytes32 key)
```

### paused

```solidity
bool paused
```


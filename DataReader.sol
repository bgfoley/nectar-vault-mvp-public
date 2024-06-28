// Sources flattened with hardhat v2.22.4 https://hardhat.org

// SPDX-License-Identifier: Apache-2.0 AND BUSL-1.1

// File contracts/interfaces/IDataStore.sol

// Original license: SPDX_License_Identifier: Apache-2.0
pragma solidity ^0.8.0;
interface IDataStore {
    function get(address key) external view returns (uint256);
}


// File contracts/interfaces/ArbSys.sol

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.0;

// @title ArbSys
// @dev Globally available variables for Arbitrum may have both an L1 and an L2
// value, the ArbSys interface is used to retrieve the L2 value
interface ArbSys {
    function arbBlockNumber() external view returns (uint256);
    function arbBlockHash(uint256 blockNumber) external view returns (bytes32);
}


// File contracts/lib/Chain.sol

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.0;

// @title Chain
// @dev Wrap the calls to retrieve chain variables to handle differences
// between chain implementations
library Chain {
    // if the ARBITRUM_CHAIN_ID changes, a new version of this library
    // and contracts depending on it would need to be deployed
    uint256 public constant ARBITRUM_CHAIN_ID = 42161;
    uint256 public constant ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

    ArbSys public constant arbSys = ArbSys(address(100));

    // @dev return the current block's timestamp
    // @return the current block's timestamp
    function currentTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }

    // @dev return the current block's number
    // @return the current block's number
    function currentBlockNumber() internal view returns (uint256) {
        if (shouldUseArbSysValues()) {
            return arbSys.arbBlockNumber();
        }

        return block.number;
    }

    // @dev return the current block's hash
    // @return the current block's hash
    function getBlockHash(uint256 blockNumber) internal view returns (bytes32) {
        if (shouldUseArbSysValues()) {
            return arbSys.arbBlockHash(blockNumber);
        }

        return blockhash(blockNumber);
    }

    function shouldUseArbSysValues() internal view returns (bool) {
        return block.chainid == ARBITRUM_CHAIN_ID || block.chainid == ARBITRUM_SEPOLIA_CHAIN_ID;
    }
}


// File contracts/lib/Order.sol

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.0;

// @title Order
// @dev Struct for orders
library Order {
    using Order for Props;

    enum OrderType {
        // @dev MarketSwap: swap token A to token B at the current market price
        // the order will be cancelled if the minOutputAmount cannot be fulfilled
        MarketSwap,
        // @dev LimitSwap: swap token A to token B if the minOutputAmount can be fulfilled
        LimitSwap,
        // @dev MarketIncrease: increase position at the current market price
        // the order will be cancelled if the position cannot be increased at the acceptablePrice
        MarketIncrease,
        // @dev LimitIncrease: increase position if the triggerPrice is reached and the acceptablePrice can be fulfilled
        LimitIncrease,
        // @dev MarketDecrease: decrease position at the current market price
        // the order will be cancelled if the position cannot be decreased at the acceptablePrice
        MarketDecrease,
        // @dev LimitDecrease: decrease position if the triggerPrice is reached and the acceptablePrice can be fulfilled
        LimitDecrease,
        // @dev StopLossDecrease: decrease position if the triggerPrice is reached and the acceptablePrice can be fulfilled
        StopLossDecrease,
        // @dev Liquidation: allows liquidation of positions if the criteria for liquidation are met
        Liquidation
    }

    // to help further differentiate orders
    enum SecondaryOrderType {
        None,
        Adl
    }

    enum DecreasePositionSwapType {
        NoSwap,
        SwapPnlTokenToCollateralToken,
        SwapCollateralTokenToPnlToken
    }

    // @dev there is a limit on the number of fields a struct can have when being passed
    // or returned as a memory variable which can cause "Stack too deep" errors
    // use sub-structs to avoid this issue
    // @param addresses address values
    // @param numbers number values
    // @param flags boolean values
    struct Props {
        Addresses addresses;
        Numbers numbers;
        Flags flags;
    }

    // @param account the account of the order
    // @param receiver the receiver for any token transfers
    // this field is meant to allow the output of an order to be
    // received by an address that is different from the creator of the
    // order whether this is for swaps or whether the account is the owner
    // of a position
    // for funding fees and claimable collateral, the funds are still
    // credited to the owner of the position indicated by order.account
    // @param callbackContract the contract to call for callbacks
    // @param uiFeeReceiver the ui fee receiver
    // @param market the trading market
    // @param initialCollateralToken for increase orders, initialCollateralToken
    // is the token sent in by the user, the token will be swapped through the
    // specified swapPath, before being deposited into the position as collateral
    // for decrease orders, initialCollateralToken is the collateral token of the position
    // withdrawn collateral from the decrease of the position will be swapped
    // through the specified swapPath
    // for swaps, initialCollateralToken is the initial token sent for the swap
    // @param swapPath an array of market addresses to swap through
    struct Addresses {
        address account;
        address receiver;
        address callbackContract;
        address uiFeeReceiver;
        address market;
        address initialCollateralToken;
        address[] swapPath;
    }

    // @param sizeDeltaUsd the requested change in position size
    // @param initialCollateralDeltaAmount for increase orders, initialCollateralDeltaAmount
    // is the amount of the initialCollateralToken sent in by the user
    // for decrease orders, initialCollateralDeltaAmount is the amount of the position's
    // collateralToken to withdraw
    // for swaps, initialCollateralDeltaAmount is the amount of initialCollateralToken sent
    // in for the swap
    // @param orderType the order type
    // @param triggerPrice the trigger price for non-market orders
    // @param acceptablePrice the acceptable execution price for increase / decrease orders
    // @param executionFee the execution fee for keepers
    // @param callbackGasLimit the gas limit for the callbackContract
    // @param minOutputAmount the minimum output amount for decrease orders and swaps
    // note that for decrease orders, multiple tokens could be received, for this reason, the
    // minOutputAmount value is treated as a USD value for validation in decrease orders
    // @param updatedAtBlock the block at which the order was last updated
    struct Numbers {
        OrderType orderType;
        DecreasePositionSwapType decreasePositionSwapType;
        uint256 sizeDeltaUsd;
        uint256 initialCollateralDeltaAmount;
        uint256 triggerPrice;
        uint256 acceptablePrice;
        uint256 executionFee;
        uint256 callbackGasLimit;
        uint256 minOutputAmount;
        uint256 updatedAtBlock;
    }

    // @param isLong whether the order is for a long or short
    // @param shouldUnwrapNativeToken whether to unwrap native tokens before
    // transferring to the user
    // @param isFrozen whether the order is frozen
    struct Flags {
        bool isLong;
        bool shouldUnwrapNativeToken;
        bool isFrozen;
    }
}


// File contracts/lib/Position.sol

// Original license: SPDX_License_Identifier: BUSL-1.1

pragma solidity ^0.8.0;

// @title Position
// @dev Stuct for positions
//
// borrowing fees for position require only a borrowingFactor to track
// an example on how this works is if the global cumulativeBorrowingFactor is 10020%
// a position would be opened with borrowingFactor as 10020%
// after some time, if the cumulativeBorrowingFactor is updated to 10025% the position would
// owe 5% of the position size as borrowing fees
// the total pending borrowing fees of all positions is factored into the calculation of the pool value for LPs
// when a position is increased or decreased, the pending borrowing fees for the position is deducted from the position's
// collateral and transferred into the LP pool
//
// the same borrowing fee factor tracking cannot be applied for funding fees as those calculations consider pending funding fees
// based on the fiat value of the position sizes
//
// for example, if the price of the longToken is $2000 and a long position owes $200 in funding fees, the opposing short position
// claims the funding fees of 0.1 longToken ($200), if the price of the longToken changes to $4000 later, the long position would
// only owe 0.05 longToken ($200)
// this would result in differences between the amounts deducted and amounts paid out, for this reason, the actual token amounts
// to be deducted and to be paid out need to be tracked instead
//
// for funding fees, there are four values to consider:
// 1. long positions with market.longToken as collateral
// 2. long positions with market.shortToken as collateral
// 3. short positions with market.longToken as collateral
// 4. short positions with market.shortToken as collateral
library Position {
    // @dev there is a limit on the number of fields a struct can have when being passed
    // or returned as a memory variable which can cause "Stack too deep" errors
    // use sub-structs to avoid this issue
    // @param addresses address values
    // @param numbers number values
    // @param flags boolean values
    struct Props {
        Addresses addresses;
        Numbers numbers;
        Flags flags;
    }

    // @param account the position's account
    // @param market the position's market
    // @param collateralToken the position's collateralToken
    struct Addresses {
        address account;
        address market;
        address collateralToken;
    }

    // @param sizeInUsd the position's size in USD
    // @param sizeInTokens the position's size in tokens
    // @param collateralAmount the amount of collateralToken for collateral
    // @param borrowingFactor the position's borrowing factor
    // @param fundingFeeAmountPerSize the position's funding fee per size
    // @param longTokenClaimableFundingAmountPerSize the position's claimable funding amount per size
    // for the market.longToken
    // @param shortTokenClaimableFundingAmountPerSize the position's claimable funding amount per size
    // for the market.shortToken
    // @param increasedAtBlock the block at which the position was last increased
    // @param decreasedAtBlock the block at which the position was last decreased
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

    // @param isLong whether the position is a long or short
    struct Flags {
        bool isLong;
    }

    function account(Props memory props) internal pure returns (address) {
        return props.addresses.account;
    }

    function setAccount(Props memory props, address value) internal pure {
        props.addresses.account = value;
    }

    function market(Props memory props) internal pure returns (address) {
        return props.addresses.market;
    }

    function setMarket(Props memory props, address value) internal pure {
        props.addresses.market = value;
    }

    function collateralToken(Props memory props) internal pure returns (address) {
        return props.addresses.collateralToken;
    }

    function setCollateralToken(Props memory props, address value) internal pure {
        props.addresses.collateralToken = value;
    }

    function sizeInUsd(Props memory props) internal pure returns (uint256) {
        return props.numbers.sizeInUsd;
    }

    function setSizeInUsd(Props memory props, uint256 value) internal pure {
        props.numbers.sizeInUsd = value;
    }

    function sizeInTokens(Props memory props) internal pure returns (uint256) {
        return props.numbers.sizeInTokens;
    }

    function setSizeInTokens(Props memory props, uint256 value) internal pure {
        props.numbers.sizeInTokens = value;
    }

    function collateralAmount(Props memory props) internal pure returns (uint256) {
        return props.numbers.collateralAmount;
    }

    function setCollateralAmount(Props memory props, uint256 value) internal pure {
        props.numbers.collateralAmount = value;
    }

    function borrowingFactor(Props memory props) internal pure returns (uint256) {
        return props.numbers.borrowingFactor;
    }

    function setBorrowingFactor(Props memory props, uint256 value) internal pure {
        props.numbers.borrowingFactor = value;
    }

    function fundingFeeAmountPerSize(Props memory props) internal pure returns (uint256) {
        return props.numbers.fundingFeeAmountPerSize;
    }

    function setFundingFeeAmountPerSize(Props memory props, uint256 value) internal pure {
        props.numbers.fundingFeeAmountPerSize = value;
    }

    function longTokenClaimableFundingAmountPerSize(Props memory props) internal pure returns (uint256) {
        return props.numbers.longTokenClaimableFundingAmountPerSize;
    }

    function setLongTokenClaimableFundingAmountPerSize(Props memory props, uint256 value) internal pure {
        props.numbers.longTokenClaimableFundingAmountPerSize = value;
    }

    function shortTokenClaimableFundingAmountPerSize(Props memory props) internal pure returns (uint256) {
        return props.numbers.shortTokenClaimableFundingAmountPerSize;
    }

    function setShortTokenClaimableFundingAmountPerSize(Props memory props, uint256 value) internal pure {
        props.numbers.shortTokenClaimableFundingAmountPerSize = value;
    }

    function increasedAtBlock(Props memory props) internal pure returns (uint256) {
        return props.numbers.increasedAtBlock;
    }

    function setIncreasedAtBlock(Props memory props, uint256 value) internal pure {
        props.numbers.increasedAtBlock = value;
    }

    function decreasedAtBlock(Props memory props) internal pure returns (uint256) {
        return props.numbers.decreasedAtBlock;
    }

    function setDecreasedAtBlock(Props memory props, uint256 value) internal pure {
        props.numbers.decreasedAtBlock = value;
    }

    function isLong(Props memory props) internal pure returns (bool) {
        return props.flags.isLong;
    }

    function setIsLong(Props memory props, bool value) internal pure {
        props.flags.isLong = value;
    }
}


// File contracts/interfaces/IReader.sol

// Original license: SPDX_License_Identifier: Apache-2.0
pragma solidity ^0.8.0;


/// @dev Interface for GMX's Reader contract
interface IReader {
    function getAccountPositions(address dataStore, address account, uint256 start, uint256 end) external view returns (Position.Props[] memory);

     function getOrder(address dataStore, bytes32 key) external view returns (Order.Props memory);
}


// File contracts/interfaces/IRoleStore.sol

// Original license: SPDX_License_Identifier: Apache-2.0
pragma solidity ^0.8.0;
interface IRoleStore {
    function hasRole(address account, bytes32 role) external view returns (bool);
}


// File contracts/DataReader.sol

// Original license: SPDX_License_Identifier: Apache-2.0
pragma solidity ^0.8.0;





contract DataReader {

    address public constant READER_ADDRESS = 0x22199a49A999c351eF7927602CFB187ec3cae489;
    address public constant DATASTORE_ADDRESS = 0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8;

    /// @dev GMX reader contract 
    IReader public reader;
    /// @dev GMX datastore
    IDataStore public dataStore;

    constructor(){
         reader = IReader(READER_ADDRESS);
        dataStore = IDataStore(DATASTORE_ADDRESS);
    }

     /**
     * @notice Get order props for a pending order
     * @param key is the order key
     * @return Array of Order.Props with the user's order details
     */
    function getOrderDetails(bytes32 key) external view returns (Order.Props memory) {
        return reader.getOrder(address(dataStore), key);
    }

    /**
     * @notice Get the size of the short position held by the contract
     * @return The size of the short position in USD
     */
    function getPositionSizeUsd(address strategy) external view returns (uint256) {
        Position.Props[] memory positions = reader.getAccountPositions(address(dataStore), strategy, 0, 1);
        if (positions.length > 0 && !Position.isLong(positions[0])) {
            return Position.sizeInUsd(positions[0]);
        }
        return 0;
    }

    /**
     * @notice Get the size of the short position held by the contract
     * @return The size of the short position in tokens
     */
    function getPositionSizeTokens(address strategy) external view returns (uint256) {
        Position.Props[] memory positions = reader.getAccountPositions(address(dataStore), strategy, 0, 1);
        if (positions.length > 0 && !Position.isLong(positions[0])) {
            return Position.sizeInTokens(positions[0]);
        }
        return 0;
    }

    /**
     * @notice Get the size of the short position held by the contract
     * @return The size of the short position in USD
     */
    function getCollateralAmount(address strategy) external view returns (uint256) {
        Position.Props[] memory positions = reader.getAccountPositions(address(dataStore), strategy, 0, 1);
        if (positions.length > 0 && !Position.isLong(positions[0])) {
            return Position.collateralAmount(positions[0]);
        }
        return 0;
    }

}

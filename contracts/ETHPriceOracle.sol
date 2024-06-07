// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the Chainlink AggregatorV3Interface
import "./interfaces/chainlink/AggregatorV3Interface.sol";

contract ETHPriceOracle {
    // Address of the Chainlink ETH/USD price feed on Arbitrum
    address private constant CHAINLINK_ETH_USD = 0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612;

    // Instance of the AggregatorV3Interface
    AggregatorV3Interface internal priceFeed;

    constructor() {
        priceFeed = AggregatorV3Interface(CHAINLINK_ETH_USD);
    }

    /**
     * Returns the latest ETH price in USD
     */
    function getLatestETHPrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        return price;
    }
}

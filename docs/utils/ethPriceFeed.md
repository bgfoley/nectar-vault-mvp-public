# Solidity API

## DataConsumerV3

If you are reading data feeds on L2 networks, you must
check the latest answer from the L2 Sequencer Uptime
Feed to ensure that the data is accurate in the event
of an L2 sequencer outage. See the
https://docs.chain.link/data-feeds/l2-sequencer-feeds
page for details.

### dataFeed

```solidity
contract AggregatorV3Interface dataFeed
```

### constructor

```solidity
constructor() public
```

Network: Arbitrum
Aggregator: ETH/USD
Address: 0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612

### getChainlinkDataFeedLatestAnswer

```solidity
function getChainlinkDataFeedLatestAnswer() public view returns (int256)
```

Returns the latest answer.


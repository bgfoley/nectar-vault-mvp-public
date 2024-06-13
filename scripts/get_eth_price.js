const axios = require('axios');

class OraclePrices {
    constructor(chain) {
        this.chain = chain;
        this.oracleUrl = {
            "arbitrum": "https://arbitrum-api.gmxinfra.io/signed_prices/latest",
            "avalanche": "https://avalanche-api.gmxinfra.io/signed_prices/latest"
        };
    }

    async getRecentPrices() {
        try {
            const rawOutput = await this._makeQuery();
            return this._processOutput(rawOutput.data);
        } catch (error) {
            console.error('Error fetching recent prices:', error);
            throw error;
        }
    }

    async _makeQuery() {
        const url = this.oracleUrl[this.chain];
        return axios.get(url);
    }

    _processOutput(output) {
        const processed = {};
        for (const item of output.signedPrices) {
            processed[item.tokenAddress] = item;
        }
        return processed;
    }
}

async function getMedianETHPrice(chain) {
    const oraclePrices = new OraclePrices(chain);
    try {
        const prices = await oraclePrices.getRecentPrices();
        const ethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // Assuming ETH address for Arbitrum
        if (prices[ethAddress]) {
            const ethMaxPrice = parseFloat(prices[ethAddress].maxPriceFull);
            const ethMinPrice = parseFloat(prices[ethAddress].minPriceFull);
            const medianPrice = (ethMaxPrice + ethMinPrice) / 2 / 1e30;
            console.log(`Median ETH Price (USD): ${medianPrice}`);
        } else {
            console.error('ETH price data not found.');
        }
    } catch (error) {
        console.error('Failed to get recent prices:', error);
    }
}

// Example usage:
const chain = 'arbitrum'; // or 'avalanche'
getMedianETHPrice(chain);



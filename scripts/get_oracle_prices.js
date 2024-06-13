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

// Example usage:
(async () => {
    const chain = 'arbitrum'; // or 'avalanche'
    const oraclePrices = new OraclePrices(chain);
    try {
        const prices = await oraclePrices.getRecentPrices();
        console.log(prices);
    } catch (error) {
        console.error('Failed to get recent prices:', error);
    }
})();

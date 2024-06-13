const axios = require('axios');

async function getSignedPrices(tokenAddress) {
  try {
    const response = await axios.get('https://arbitrum-api.gmxinfra.io/signed_prices/latest');
    const tokenData = response.data.signedPrices.find(price => price.tokenAddress === tokenAddress);
    const prices = [parseFloat(tokenData.maxPriceFull), parseFloat(tokenData.minPriceFull)];
    const price = (prices[0] + prices[1]) / 2 / 1e30;
    return price;
  } catch (error) {
    console.error(`Error getting price for token ${tokenAddress}:`, error);
  }
}

module.exports = getSignedPrices;

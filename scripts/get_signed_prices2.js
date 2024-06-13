const axios = require('axios');

async function getSignedPrices(tokenAddress) {
  try {
    const response = await axios.get('https://arbitrum-api.gmxinfra.io/signed_prices/latest');
    const tokenData = response.data.signedPrices.find(price => price.tokenAddress === tokenAddress);
    const maxPriceFull = BigInt(tokenData.maxPriceFull);
    const minPriceFull = BigInt(tokenData.minPriceFull);
    const price = (maxPriceFull + minPriceFull) / 2n;
    return price;
  } catch (error) {
    console.error(`Error getting price for token ${tokenAddress}:`, error);
  }
}

module.exports = getSignedPrices;

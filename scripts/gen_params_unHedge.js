require('dotenv').config();
const { exec } = require('child_process');
const readlineSync = require('readline-sync');

// Import the previously written unHedge script
const generateUnHedgeParams = require('./create_order_unHedge');

async function main() {
  try {
    // Execute the generate_unhedge_params script and capture its output
    const output = await new Promise((resolve, reject) => {
      exec('node scripts/create_order_unHedge.js', (error, stdout, stderr) => {
        if (error) {
          reject(`Error: ${error.message}`);
        } else if (stderr) {
          reject(`Stderr: ${stderr}`);
        } else {
          resolve(stdout);
        }
      });
    });

    // Parse the output to get the CreateOrderParams struct
    const paramsStart = output.indexOf('Order Parameters:') + 'Order Parameters:'.length;
    const paramsJson = output.slice(paramsStart).trim();
    const orderParams = JSON.parse(paramsJson);

    // Format the CreateOrderParams struct for copy-pasting
    const formattedParams = `
    CreateOrderParams(
      ${orderParams.addresses.receiver},
      ${orderParams.addresses.callbackContract},
      ${orderParams.addresses.uiFeeReceiver},
      ${orderParams.addresses.market},
      ${orderParams.addresses.initialCollateralToken},
      [],
      ${orderParams.numbers.sizeDeltaUsd},
      ${orderParams.numbers.initialCollateralDeltaAmount},
      ${orderParams.numbers.triggerPrice},
      ${orderParams.numbers.acceptablePrice},
      ${orderParams.numbers.executionFee},
      ${orderParams.numbers.callbackGasLimit},
      ${orderParams.numbers.minOutputAmount},
      ${orderParams.orderType},
      ${orderParams.decreasePositionSwapType},
      ${orderParams.isLong},
      ${orderParams.shouldUnwrapNativeToken},
      ${orderParams.referralCode}
    )
    `;

    console.log('Formatted CreateOrderParams:');
    console.log(formattedParams);

  } catch (error) {
    console.error('Error in main script:', error);
  }
}

main();

require('dotenv').config();
const readlineSync = require('readline-sync');
const { ethers } = require('hardhat');
const getSignedPrices = require('../scripts/get_signed_prices');

// Load environment variables
const ARBITRUM_URL = process.env.ARBITRUM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // Example token address
const GMX_MARKET = '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336';
const HEDGE_VAULT = '0x58e62fdc1c7C593F09C58188741AFbBB75F30A93';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Connect to Arbitrum network
const provider = new ethers.JsonRpcProvider(ARBITRUM_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Load the Hedge contract ABI
const hedgeAbi = [
          {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "target",
                "type": "address"
              }
            ],
            "name": "AddressEmptyCode",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "AddressInsufficientBalance",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "allowance",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
              }
            ],
            "name": "ERC20InsufficientAllowance",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "balance",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "needed",
                "type": "uint256"
              }
            ],
            "name": "ERC20InsufficientBalance",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "approver",
                "type": "address"
              }
            ],
            "name": "ERC20InvalidApprover",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
              }
            ],
            "name": "ERC20InvalidReceiver",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "sender",
                "type": "address"
              }
            ],
            "name": "ERC20InvalidSender",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              }
            ],
            "name": "ERC20InvalidSpender",
            "type": "error"
          },
          {
            "inputs": [],
            "name": "FailedInnerCall",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              }
            ],
            "name": "OwnableInvalidOwner",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "OwnableUnauthorizedAccount",
            "type": "error"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              }
            ],
            "name": "SafeERC20FailedOperation",
            "type": "error"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "Approval",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "sizeDeltaUsd",
                "type": "uint256"
              }
            ],
            "name": "HedgeClosed",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "sizeDeltaUsd",
                "type": "uint256"
              }
            ],
            "name": "HedgeOpened",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "collateralAmount",
                "type": "uint256"
              }
            ],
            "name": "OrderCancelled",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "collateralAmount",
                "type": "uint256"
              }
            ],
            "name": "OrderExecuted",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              }
            ],
            "name": "OrderFrozen",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "Transfer",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": false,
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              }
            ],
            "name": "UnexpectedOrderType",
            "type": "event"
          },
          {
            "inputs": [],
            "name": "GMX_MARKET",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "GMX_ROUTER",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "HEDGE_VAULT",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "ORDER_VAULT",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "ROLESTORE_ADDRESS",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "USDC",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "WETH",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "ZERO_ADDRESS",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "internalType": "address",
                        "name": "receiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "callbackContract",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "uiFeeReceiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "market",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "initialCollateralToken",
                        "type": "address"
                      },
                      {
                        "internalType": "address[]",
                        "name": "swapPath",
                        "type": "address[]"
                      }
                    ],
                    "internalType": "struct IBaseOrderUtils.CreateOrderParamsAddresses",
                    "name": "addresses",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "internalType": "uint256",
                        "name": "sizeDeltaUsd",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "initialCollateralDeltaAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "triggerPrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "acceptablePrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "executionFee",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "callbackGasLimit",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "minOutputAmount",
                        "type": "uint256"
                      }
                    ],
                    "internalType": "struct IBaseOrderUtils.CreateOrderParamsNumbers",
                    "name": "numbers",
                    "type": "tuple"
                  },
                  {
                    "internalType": "enum Order.OrderType",
                    "name": "orderType",
                    "type": "uint8"
                  },
                  {
                    "internalType": "enum Order.DecreasePositionSwapType",
                    "name": "decreasePositionSwapType",
                    "type": "uint8"
                  },
                  {
                    "internalType": "bool",
                    "name": "isLong",
                    "type": "bool"
                  },
                  {
                    "internalType": "bool",
                    "name": "shouldUnwrapNativeToken",
                    "type": "bool"
                  },
                  {
                    "internalType": "bytes32",
                    "name": "referralCode",
                    "type": "bytes32"
                  }
                ],
                "internalType": "struct IBaseOrderUtils.CreateOrderParams",
                "name": "orderParams",
                "type": "tuple"
              }
            ],
            "name": "_hedge",
            "outputs": [
              {
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "internalType": "address",
                "name": "orderAccount",
                "type": "address"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "user",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "internalType": "address",
                        "name": "receiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "callbackContract",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "uiFeeReceiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "market",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "initialCollateralToken",
                        "type": "address"
                      },
                      {
                        "internalType": "address[]",
                        "name": "swapPath",
                        "type": "address[]"
                      }
                    ],
                    "internalType": "struct IBaseOrderUtils.CreateOrderParamsAddresses",
                    "name": "addresses",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "internalType": "uint256",
                        "name": "sizeDeltaUsd",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "initialCollateralDeltaAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "triggerPrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "acceptablePrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "executionFee",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "callbackGasLimit",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "minOutputAmount",
                        "type": "uint256"
                      }
                    ],
                    "internalType": "struct IBaseOrderUtils.CreateOrderParamsNumbers",
                    "name": "numbers",
                    "type": "tuple"
                  },
                  {
                    "internalType": "enum Order.OrderType",
                    "name": "orderType",
                    "type": "uint8"
                  },
                  {
                    "internalType": "enum Order.DecreasePositionSwapType",
                    "name": "decreasePositionSwapType",
                    "type": "uint8"
                  },
                  {
                    "internalType": "bool",
                    "name": "isLong",
                    "type": "bool"
                  },
                  {
                    "internalType": "bool",
                    "name": "shouldUnwrapNativeToken",
                    "type": "bool"
                  },
                  {
                    "internalType": "bytes32",
                    "name": "referralCode",
                    "type": "bytes32"
                  }
                ],
                "internalType": "struct IBaseOrderUtils.CreateOrderParams",
                "name": "orderParams",
                "type": "tuple"
              }
            ],
            "name": "_unHedge",
            "outputs": [
              {
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "internalType": "address",
                "name": "orderAccount",
                "type": "address"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "name": "accountOrders",
            "outputs": [
              {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "receiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "callbackContract",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "uiFeeReceiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "market",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "initialCollateralToken",
                        "type": "address"
                      },
                      {
                        "internalType": "address[]",
                        "name": "swapPath",
                        "type": "address[]"
                      }
                    ],
                    "internalType": "struct Order.Addresses",
                    "name": "addresses",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "internalType": "enum Order.OrderType",
                        "name": "orderType",
                        "type": "uint8"
                      },
                      {
                        "internalType": "enum Order.DecreasePositionSwapType",
                        "name": "decreasePositionSwapType",
                        "type": "uint8"
                      },
                      {
                        "internalType": "uint256",
                        "name": "sizeDeltaUsd",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "initialCollateralDeltaAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "triggerPrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "acceptablePrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "executionFee",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "callbackGasLimit",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "minOutputAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "updatedAtBlock",
                        "type": "uint256"
                      }
                    ],
                    "internalType": "struct Order.Numbers",
                    "name": "numbers",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "internalType": "bool",
                        "name": "isLong",
                        "type": "bool"
                      },
                      {
                        "internalType": "bool",
                        "name": "shouldUnwrapNativeToken",
                        "type": "bool"
                      },
                      {
                        "internalType": "bool",
                        "name": "isFrozen",
                        "type": "bool"
                      }
                    ],
                    "internalType": "struct Order.Flags",
                    "name": "flags",
                    "type": "tuple"
                  }
                ],
                "internalType": "struct Order.Props",
                "name": "order",
                "type": "tuple"
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "address",
                            "name": "value",
                            "type": "address"
                          }
                        ],
                        "internalType": "struct EventUtils.AddressKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "address[]",
                            "name": "value",
                            "type": "address[]"
                          }
                        ],
                        "internalType": "struct EventUtils.AddressArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.AddressItems",
                    "name": "addressItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                          }
                        ],
                        "internalType": "struct EventUtils.UintKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "uint256[]",
                            "name": "value",
                            "type": "uint256[]"
                          }
                        ],
                        "internalType": "struct EventUtils.UintArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.UintItems",
                    "name": "uintItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "int256",
                            "name": "value",
                            "type": "int256"
                          }
                        ],
                        "internalType": "struct EventUtils.IntKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "int256[]",
                            "name": "value",
                            "type": "int256[]"
                          }
                        ],
                        "internalType": "struct EventUtils.IntArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.IntItems",
                    "name": "intItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bool",
                            "name": "value",
                            "type": "bool"
                          }
                        ],
                        "internalType": "struct EventUtils.BoolKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bool[]",
                            "name": "value",
                            "type": "bool[]"
                          }
                        ],
                        "internalType": "struct EventUtils.BoolArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.BoolItems",
                    "name": "boolItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes32",
                            "name": "value",
                            "type": "bytes32"
                          }
                        ],
                        "internalType": "struct EventUtils.Bytes32KeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes32[]",
                            "name": "value",
                            "type": "bytes32[]"
                          }
                        ],
                        "internalType": "struct EventUtils.Bytes32ArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.Bytes32Items",
                    "name": "bytes32Items",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes",
                            "name": "value",
                            "type": "bytes"
                          }
                        ],
                        "internalType": "struct EventUtils.BytesKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes[]",
                            "name": "value",
                            "type": "bytes[]"
                          }
                        ],
                        "internalType": "struct EventUtils.BytesArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.BytesItems",
                    "name": "bytesItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "string",
                            "name": "value",
                            "type": "string"
                          }
                        ],
                        "internalType": "struct EventUtils.StringKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "string[]",
                            "name": "value",
                            "type": "string[]"
                          }
                        ],
                        "internalType": "struct EventUtils.StringArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.StringItems",
                    "name": "stringItems",
                    "type": "tuple"
                  }
                ],
                "internalType": "struct EventUtils.EventLogData",
                "name": "eventData",
                "type": "tuple"
              }
            ],
            "name": "afterOrderCancellation",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "receiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "callbackContract",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "uiFeeReceiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "market",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "initialCollateralToken",
                        "type": "address"
                      },
                      {
                        "internalType": "address[]",
                        "name": "swapPath",
                        "type": "address[]"
                      }
                    ],
                    "internalType": "struct Order.Addresses",
                    "name": "addresses",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "internalType": "enum Order.OrderType",
                        "name": "orderType",
                        "type": "uint8"
                      },
                      {
                        "internalType": "enum Order.DecreasePositionSwapType",
                        "name": "decreasePositionSwapType",
                        "type": "uint8"
                      },
                      {
                        "internalType": "uint256",
                        "name": "sizeDeltaUsd",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "initialCollateralDeltaAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "triggerPrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "acceptablePrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "executionFee",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "callbackGasLimit",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "minOutputAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "updatedAtBlock",
                        "type": "uint256"
                      }
                    ],
                    "internalType": "struct Order.Numbers",
                    "name": "numbers",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "internalType": "bool",
                        "name": "isLong",
                        "type": "bool"
                      },
                      {
                        "internalType": "bool",
                        "name": "shouldUnwrapNativeToken",
                        "type": "bool"
                      },
                      {
                        "internalType": "bool",
                        "name": "isFrozen",
                        "type": "bool"
                      }
                    ],
                    "internalType": "struct Order.Flags",
                    "name": "flags",
                    "type": "tuple"
                  }
                ],
                "internalType": "struct Order.Props",
                "name": "order",
                "type": "tuple"
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "address",
                            "name": "value",
                            "type": "address"
                          }
                        ],
                        "internalType": "struct EventUtils.AddressKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "address[]",
                            "name": "value",
                            "type": "address[]"
                          }
                        ],
                        "internalType": "struct EventUtils.AddressArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.AddressItems",
                    "name": "addressItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                          }
                        ],
                        "internalType": "struct EventUtils.UintKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "uint256[]",
                            "name": "value",
                            "type": "uint256[]"
                          }
                        ],
                        "internalType": "struct EventUtils.UintArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.UintItems",
                    "name": "uintItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "int256",
                            "name": "value",
                            "type": "int256"
                          }
                        ],
                        "internalType": "struct EventUtils.IntKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "int256[]",
                            "name": "value",
                            "type": "int256[]"
                          }
                        ],
                        "internalType": "struct EventUtils.IntArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.IntItems",
                    "name": "intItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bool",
                            "name": "value",
                            "type": "bool"
                          }
                        ],
                        "internalType": "struct EventUtils.BoolKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bool[]",
                            "name": "value",
                            "type": "bool[]"
                          }
                        ],
                        "internalType": "struct EventUtils.BoolArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.BoolItems",
                    "name": "boolItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes32",
                            "name": "value",
                            "type": "bytes32"
                          }
                        ],
                        "internalType": "struct EventUtils.Bytes32KeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes32[]",
                            "name": "value",
                            "type": "bytes32[]"
                          }
                        ],
                        "internalType": "struct EventUtils.Bytes32ArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.Bytes32Items",
                    "name": "bytes32Items",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes",
                            "name": "value",
                            "type": "bytes"
                          }
                        ],
                        "internalType": "struct EventUtils.BytesKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes[]",
                            "name": "value",
                            "type": "bytes[]"
                          }
                        ],
                        "internalType": "struct EventUtils.BytesArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.BytesItems",
                    "name": "bytesItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "string",
                            "name": "value",
                            "type": "string"
                          }
                        ],
                        "internalType": "struct EventUtils.StringKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "string[]",
                            "name": "value",
                            "type": "string[]"
                          }
                        ],
                        "internalType": "struct EventUtils.StringArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.StringItems",
                    "name": "stringItems",
                    "type": "tuple"
                  }
                ],
                "internalType": "struct EventUtils.EventLogData",
                "name": "eventData",
                "type": "tuple"
              }
            ],
            "name": "afterOrderExecution",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "receiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "callbackContract",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "uiFeeReceiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "market",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "initialCollateralToken",
                        "type": "address"
                      },
                      {
                        "internalType": "address[]",
                        "name": "swapPath",
                        "type": "address[]"
                      }
                    ],
                    "internalType": "struct Order.Addresses",
                    "name": "addresses",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "internalType": "enum Order.OrderType",
                        "name": "orderType",
                        "type": "uint8"
                      },
                      {
                        "internalType": "enum Order.DecreasePositionSwapType",
                        "name": "decreasePositionSwapType",
                        "type": "uint8"
                      },
                      {
                        "internalType": "uint256",
                        "name": "sizeDeltaUsd",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "initialCollateralDeltaAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "triggerPrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "acceptablePrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "executionFee",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "callbackGasLimit",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "minOutputAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "updatedAtBlock",
                        "type": "uint256"
                      }
                    ],
                    "internalType": "struct Order.Numbers",
                    "name": "numbers",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "internalType": "bool",
                        "name": "isLong",
                        "type": "bool"
                      },
                      {
                        "internalType": "bool",
                        "name": "shouldUnwrapNativeToken",
                        "type": "bool"
                      },
                      {
                        "internalType": "bool",
                        "name": "isFrozen",
                        "type": "bool"
                      }
                    ],
                    "internalType": "struct Order.Flags",
                    "name": "flags",
                    "type": "tuple"
                  }
                ],
                "internalType": "struct Order.Props",
                "name": "order",
                "type": "tuple"
              },
              {
                "components": [
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "address",
                            "name": "value",
                            "type": "address"
                          }
                        ],
                        "internalType": "struct EventUtils.AddressKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "address[]",
                            "name": "value",
                            "type": "address[]"
                          }
                        ],
                        "internalType": "struct EventUtils.AddressArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.AddressItems",
                    "name": "addressItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                          }
                        ],
                        "internalType": "struct EventUtils.UintKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "uint256[]",
                            "name": "value",
                            "type": "uint256[]"
                          }
                        ],
                        "internalType": "struct EventUtils.UintArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.UintItems",
                    "name": "uintItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "int256",
                            "name": "value",
                            "type": "int256"
                          }
                        ],
                        "internalType": "struct EventUtils.IntKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "int256[]",
                            "name": "value",
                            "type": "int256[]"
                          }
                        ],
                        "internalType": "struct EventUtils.IntArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.IntItems",
                    "name": "intItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bool",
                            "name": "value",
                            "type": "bool"
                          }
                        ],
                        "internalType": "struct EventUtils.BoolKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bool[]",
                            "name": "value",
                            "type": "bool[]"
                          }
                        ],
                        "internalType": "struct EventUtils.BoolArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.BoolItems",
                    "name": "boolItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes32",
                            "name": "value",
                            "type": "bytes32"
                          }
                        ],
                        "internalType": "struct EventUtils.Bytes32KeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes32[]",
                            "name": "value",
                            "type": "bytes32[]"
                          }
                        ],
                        "internalType": "struct EventUtils.Bytes32ArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.Bytes32Items",
                    "name": "bytes32Items",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes",
                            "name": "value",
                            "type": "bytes"
                          }
                        ],
                        "internalType": "struct EventUtils.BytesKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "bytes[]",
                            "name": "value",
                            "type": "bytes[]"
                          }
                        ],
                        "internalType": "struct EventUtils.BytesArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.BytesItems",
                    "name": "bytesItems",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "string",
                            "name": "value",
                            "type": "string"
                          }
                        ],
                        "internalType": "struct EventUtils.StringKeyValue[]",
                        "name": "items",
                        "type": "tuple[]"
                      },
                      {
                        "components": [
                          {
                            "internalType": "string",
                            "name": "key",
                            "type": "string"
                          },
                          {
                            "internalType": "string[]",
                            "name": "value",
                            "type": "string[]"
                          }
                        ],
                        "internalType": "struct EventUtils.StringArrayKeyValue[]",
                        "name": "arrayItems",
                        "type": "tuple[]"
                      }
                    ],
                    "internalType": "struct EventUtils.StringItems",
                    "name": "stringItems",
                    "type": "tuple"
                  }
                ],
                "internalType": "struct EventUtils.EventLogData",
                "name": "eventData",
                "type": "tuple"
              }
            ],
            "name": "afterOrderFrozen",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              }
            ],
            "name": "allowance",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "approve",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "account",
                "type": "address"
              }
            ],
            "name": "balanceOf",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "claimFundingFees",
            "outputs": [
              {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "decimals",
            "outputs": [
              {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "defaultOrderParamsAddresses",
            "outputs": [
              {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "callbackContract",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "uiFeeReceiver",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "market",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "initialCollateralToken",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "acceptablePrice",
                "type": "uint256"
              }
            ],
            "name": "hedge",
            "outputs": [
              {
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "internalType": "address",
                "name": "orderAccount",
                "type": "address"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "initialize",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "name": "lockedShares",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "name",
            "outputs": [
              {
                "internalType": "string",
                "name": "",
                "type": "string"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
              }
            ],
            "name": "orders",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "owner",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "components": [
                  {
                    "components": [
                      {
                        "internalType": "address",
                        "name": "receiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "callbackContract",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "uiFeeReceiver",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "market",
                        "type": "address"
                      },
                      {
                        "internalType": "address",
                        "name": "initialCollateralToken",
                        "type": "address"
                      },
                      {
                        "internalType": "address[]",
                        "name": "swapPath",
                        "type": "address[]"
                      }
                    ],
                    "internalType": "struct IBaseOrderUtils.CreateOrderParamsAddresses",
                    "name": "addresses",
                    "type": "tuple"
                  },
                  {
                    "components": [
                      {
                        "internalType": "uint256",
                        "name": "sizeDeltaUsd",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "initialCollateralDeltaAmount",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "triggerPrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "acceptablePrice",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "executionFee",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "callbackGasLimit",
                        "type": "uint256"
                      },
                      {
                        "internalType": "uint256",
                        "name": "minOutputAmount",
                        "type": "uint256"
                      }
                    ],
                    "internalType": "struct IBaseOrderUtils.CreateOrderParamsNumbers",
                    "name": "numbers",
                    "type": "tuple"
                  },
                  {
                    "internalType": "enum Order.OrderType",
                    "name": "orderType",
                    "type": "uint8"
                  },
                  {
                    "internalType": "enum Order.DecreasePositionSwapType",
                    "name": "decreasePositionSwapType",
                    "type": "uint8"
                  },
                  {
                    "internalType": "bool",
                    "name": "isLong",
                    "type": "bool"
                  },
                  {
                    "internalType": "bool",
                    "name": "shouldUnwrapNativeToken",
                    "type": "bool"
                  },
                  {
                    "internalType": "bytes32",
                    "name": "referralCode",
                    "type": "bytes32"
                  }
                ],
                "internalType": "struct IBaseOrderUtils.CreateOrderParams",
                "name": "orderParams",
                "type": "tuple"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "name": "ownerPlaceOrder",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "paused",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              }
            ],
            "name": "recoverStuckFunds",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "roleStore",
            "outputs": [
              {
                "internalType": "contract IRoleStore",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "symbol",
            "outputs": [
              {
                "internalType": "string",
                "name": "",
                "type": "string"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "togglePause",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "transfer",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "from",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              }
            ],
            "name": "transferFrom",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "acceptablePrice",
                "type": "uint256"
              }
            ],
            "name": "unHedge",
            "outputs": [
              {
                "internalType": "bytes32",
                "name": "key",
                "type": "bytes32"
              },
              {
                "internalType": "address",
                "name": "orderAccount",
                "type": "address"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "stateMutability": "payable",
            "type": "receive"
          }
      
  ];
const hedgeContract = new ethers.Contract(HEDGE_VAULT, hedgeAbi, wallet);

// Load the WETH token ABI
const wethAbi = [
  "function approve(address spender, uint256 amount) external returns (bool)"
];
const wethContract = new ethers.Contract(TOKEN_ADDRESS, wethAbi, wallet);

async function main() {
  try {
    // Step 1: Query the deposit amount in ETH from the user
    const depositEth = readlineSync.question('Enter the amount of ETH to deposit: ');
    const depositEthBn = ethers.parseUnits(depositEth, 18);

    // Step 2: Define execution fee and callback gas limit
    const executionFeeBn = BigInt('3000000000000'); // 3e-06 ETH
    const callbackGasLimitBn = BigInt('1500000000000'); // 1.5e-06 ETH

    // Step 3: Calculate the actual collateral delta (ETH)
    const collateralDeltaEth = depositEthBn - (executionFeeBn + callbackGasLimitBn);
    if (collateralDeltaEth <= 0) {
      console.error("Deposit amount is too low to cover the execution fee and callback gas limit.");
      return;
    }

    // Step 4: Fetch ETH price
    const ethPrice = await getSignedPrices(TOKEN_ADDRESS);
    const ethPriceUsd = BigInt(ethPrice) / (BigInt(10) ** BigInt(30));

    // Step 5: Calculate the position size in USD based on the collateral delta
    const sizeDeltaUsd = (collateralDeltaEth * BigInt(ethPrice)) / (BigInt(10) ** BigInt(18));

    // Step 6: Create the order parameters
    const slippageTolerance = readlineSync.question('Enter your slippage tolerance (e.g., 0.01 for 1%): ');
    const slippageMultiplier = BigInt(Math.floor((1 - parseFloat(slippageTolerance)) * 1e18));
    const acceptablePrice = (BigInt(ethPrice) * slippageMultiplier) / BigInt(10 ** 18);

    const orderParams = {
      addresses: {
        receiver: HEDGE_VAULT,
        callbackContract: HEDGE_VAULT,
        uiFeeReceiver: ZERO_ADDRESS,
        market: GMX_MARKET,
        initialCollateralToken: TOKEN_ADDRESS,
        swapPath: []
      },
      numbers: {
        sizeDeltaUsd: sizeDeltaUsd.toString(),
        initialCollateralDeltaAmount: collateralDeltaEth.toString(),
        triggerPrice: '0',
        acceptablePrice: acceptablePrice.toString(),
        executionFee: executionFeeBn.toString(),
        callbackGasLimit: callbackGasLimitBn.toString(),
        minOutputAmount: '0'
      },
      orderType: 0, // market_increase
      decreasePositionSwapType: 0, // no_swap
      isLong: false,
      shouldUnwrapNativeToken: false,
      referralCode: ethers.HashZero
    };

    // Step 7: Approve the hedge contract for transferFrom of WETH
    const approvalTx = await wethContract.approve(HEDGE_VAULT, depositEthBn);
    await approvalTx.wait();
    console.log("Tokens approved successfully");

    // Step 8: Call the internal _hedge function
    const gasLimit = 2000000; // Adjust this value based on your contract's requirements
    const hedgeTx = await hedgeContract._hedge(depositEthBn, wallet.address, orderParams, { gasLimit });
    await hedgeTx.wait();
    console.log("Hedge function executed successfully");

    // Log the order parameters
    console.log(`ETH Price (USD): ${Number(ethPriceUsd) / 1e18}`);
    console.log(`Execution Fee (ETH): ${ethers.formatUnits(executionFeeBn, 18)}`);
    console.log(`Callback Gas Limit (ETH): ${ethers.formatUnits(callbackGasLimitBn, 18)}`);
    console.log(`Collateral Delta (ETH): ${ethers.formatUnits(collateralDeltaEth, 18)}`);
    console.log(`Size Delta (USD): ${ethers.formatUnits(sizeDeltaUsd, 18)}`);
    console.log('Order Parameters:', {
      acceptablePrice: acceptablePrice.toString(),
      sizeDeltaUsd: sizeDeltaUsd.toString(),
      initialCollateralDeltaAmount: collateralDeltaEth.toString()
    });

  } catch (error) {
    console.error("Error in main script:", error);
  }
}

// Run the main function using Hardhat runtime environment
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

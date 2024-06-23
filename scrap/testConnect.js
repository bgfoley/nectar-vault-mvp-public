require('dotenv').config();
const { ethers } = require("ethers");

// Replace with your RPC provider URL
// Load environment variables
const ARBITRUM_URL = process.env.ARBITRUM_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const HEDGE_CONTRACT_ADDRESS = '0xA35021791259042B3c00E9C80618e2282183D945';
const TOKEN_ADDRESS = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // Example token address




// Replace with your contract ABI
const contractABI = [
    {
        "_format": "hh-sol-artifact-1",
        "contractName": "ShMdge",
        "sourceName": "contracts/smHedge.sol",
        "abi": [
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
        ],
        "bytecode": "0x60a0604052306080523480156200001557600080fd5b50336040518060400160405280600881526020016753684d6f6f64676560c01b8152506040518060400160405280600681526020016553684d64676560d01b8152508160039081620000689190620001b2565b506004620000778282620001b2565b5050506001600160a01b038116620000a957604051631e4fbdf760e01b81526000600482015260240160405180910390fd5b620000b481620000bb565b506200027e565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806200013857607f821691505b6020821081036200015957634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620001ad57600081815260208120601f850160051c81016020861015620001885750805b601f850160051c820191505b81811015620001a95782815560010162000194565b5050505b505050565b81516001600160401b03811115620001ce57620001ce6200010d565b620001e681620001df845462000123565b846200015f565b602080601f8311600181146200021e5760008415620002055750858301515b600019600386901b1c1916600185901b178555620001a9565b600085815260208120601f198616915b828110156200024f578886015182559484019460019091019084016200022e565b50858210156200026e5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b608051613f2a620002a8600039600081816106c601528181610cf30152610fc50152613f2a6000f3fe6080604052600436106102135760003560e01c806372abb1f9116101185780639d88d9da116100a0578063dd62ed3e1161006f578063dd62ed3e1461066e578063ddfa93de146106b4578063e336ac44146106e8578063e884214814610715578063f2fde38b1461078857600080fd5b80639d88d9da146105e9578063a9059cbb14610611578063ad5c464814610631578063c4ae31681461065957600080fd5b806389a30271116100e757806389a30271146105385780638da5cb5b1461056057806390cdaaba1461057e57806395d89b411461059e5780639c3f1e90146105b357600080fd5b806372abb1f9146104b357806375839cbe146104db5780638129fc1c146104fb5780638840d8601461051057600080fd5b80633df818611161019b5780635c975abb1161016a5780635c975abb1461040757806369e922241461042857806370a0823114610448578063710e429f1461047e578063715018a61461049e57600080fd5b80633df81861146103725780634a4a7b0414610392578063538ba4f9146103ca578063562a97e5146103df57600080fd5b806322a8b41e116101e257806322a8b41e146102d257806323b872dd146102f4578063299887dc146103145780632ef9425714610334578063313ce5671461035657600080fd5b8063032f8ac41461021f57806306fdde0314610261578063095ea7b31461028357806318160ddd146102b357600080fd5b3661021a57005b600080fd5b34801561022b57600080fd5b5061023f61023a366004612406565b6107a8565b604080519283526001600160a01b039091166020830152015b60405180910390f35b34801561026d57600080fd5b50610276610979565b604051610258919061244c565b34801561028f57600080fd5b506102a361029e36600461249b565b610a0b565b6040519015158152602001610258565b3480156102bf57600080fd5b506002545b604051908152602001610258565b3480156102de57600080fd5b506102f26102ed3660046124c5565b610a25565b005b34801561030057600080fd5b506102a361030f3660046124e0565b610b0c565b34801561032057600080fd5b506102f261032f36600461370b565b610b32565b34801561034057600080fd5b50610349610e2b565b604051610258919061385f565b34801561036257600080fd5b5060405160128152602001610258565b34801561037e57600080fd5b506102c461038d36600461249b565b61103b565b34801561039e57600080fd5b506009546103b2906001600160a01b031681565b6040516001600160a01b039091168152602001610258565b3480156103d657600080fd5b506103b2600081565b3480156103eb57600080fd5b506103b2737c68c7866a64fa2160f78eeae12217ffbf871fa881565b34801561041357600080fd5b506005546102a390600160a01b900460ff1681565b34801561043457600080fd5b506102f261044336600461370b565b61106c565b34801561045457600080fd5b506102c46104633660046124c5565b6001600160a01b031660009081526020819052604090205490565b34801561048a57600080fd5b506102f26104993660046138a3565b6111d6565b3480156104aa57600080fd5b506102f2611313565b3480156104bf57600080fd5b506103b2733c3d99fd298f679dbc2cecd132b4ec4d0f5e6e7281565b3480156104e757600080fd5b5061023f6104f6366004612406565b611327565b34801561050757600080fd5b506102f26114eb565b34801561051c57600080fd5b506103b27331ef83a530fde1b38ee9a18093a333d8bbbc40d581565b34801561054457600080fd5b506103b273af88d065e77c8cc2239327c5edb3a432268e583181565b34801561056c57600080fd5b506005546001600160a01b03166103b2565b34801561058a57600080fd5b506102f261059936600461370b565b611629565b3480156105aa57600080fd5b50610276611873565b3480156105bf57600080fd5b506103b26105ce3660046138df565b6006602052600090815260409020546001600160a01b031681565b3480156105f557600080fd5b506103b27370d95587d40a2caf56bd97485ab3eec10bee633681565b34801561061d57600080fd5b506102a361062c36600461249b565b611882565b34801561063d57600080fd5b506103b27382af49447d8a07e3bd95bd0d56f35241523fbab181565b34801561066557600080fd5b506102f2611890565b34801561067a57600080fd5b506102c46106893660046138f8565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b3480156106c057600080fd5b506103b27f000000000000000000000000000000000000000000000000000000000000000081565b3480156106f457600080fd5b506102c46107033660046124c5565b60086020526000908152604090205481565b34801561072157600080fd5b50600a54600b54600c54600d54600e5461074e946001600160a01b03908116948116938116928116911685565b604080516001600160a01b03968716815294861660208601529285169284019290925283166060830152909116608082015260a001610258565b34801561079457600080fd5b506102f26107a33660046124c5565b6118b9565b6005546000908190600160a01b900460ff16156108015760405162461bcd60e51b815260206004820152601260248201527110dbdb9d1c9858dd081a5cc81c185d5cd95960721b60448201526064015b60405180910390fd5b61080b84846118f7565b6502ba7def3000600061081e8287613941565b90506000670de0b6b3a76400006108358784613954565b61083f919061396b565b6040805160e0808201835283825260208083018790526000838501819052606084018c905260808401899052622dc6c060a085015260c0840181905284516101a081018652600a80546001600160a01b03908116958301958652600b548116610100840152600c548116610120840152600d548116610140840152600e5416610160830152600f805488518187028101870190995280895298995095979296919586959491936101808701939283018282801561092557602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311610907575b505050919092525050508152602081018490526040016002815260200160008152600060208201819052604082018190526060909101529050610969893383611990565b909a909950975050505050505050565b606060038054610988906139a3565b80601f01602080910402602001604051908101604052809291908181526020018280546109b4906139a3565b8015610a015780601f106109d657610100808354040283529160200191610a01565b820191906000526020600020905b8154815290600101906020018083116109e457829003601f168201915b5050505050905090565b600033610a19818585611ad3565b60019150505b92915050565b610a2d611ae0565b6040516370a0823160e01b81523060048201526000906001600160a01b038316906370a0823190602401602060405180830381865afa158015610a74573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a9891906139dd565b905060008111610ae25760405162461bcd60e51b81526020600482015260156024820152742737903130b630b731b2903a37903932b1b7bb32b960591b60448201526064016107f8565b610b08610af76005546001600160a01b031690565b6001600160a01b0384169083611b0d565b5050565b600033610b1a858285611b6c565b610b25858585611bea565b60019150505b9392505050565b60095460405163ac4ab3fb60e01b81523360048201527f97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b60248201526001600160a01b039091169063ac4ab3fb90604401602060405180830381865afa158015610ba0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bc491906139f6565b610be05760405162461bcd60e51b81526004016107f890613a13565b6000838152600660205260409020546001600160a01b0316610c028482611c49565b60026020840151516007811115610c1b57610c1b61398d565b03610c45576000610c33846020015160400151611d27565b9050610c3f8282611d38565b50610dd1565b60046020840151516007811115610c5e57610c5e61398d565b03610d9d576000610c76846020015160400151611d27565b6001600160a01b0383166000908152600860205260409020549091508111801590610cbf575080610cbc836001600160a01b031660009081526020819052604090205490565b10155b15610d4d57610cce8282611d6e565b602084015160600151610d1a907382af49447d8a07e3bd95bd0d56f35241523fbab1907f0000000000000000000000000000000000000000000000000000000000000000908590611da4565b6001600160a01b03821660009081526008602052604081208054839290610d42908490613941565b90915550610c3f9050565b60208401516060015160405130917f3b30d874a1731cd03fa687a03f50bf6665a8ba0244989d56df68ddb1a3d8a0ea91610d8f91898252602082015260400190565b60405180910390a250610dd1565b6040518481527fd14bd82cf43f48bfb6fe4d5349a8f9959e4c1c3f0a4520aeda92723a49c1989e9060200160405180910390a15b806001600160a01b03167f3b30d874a1731cd03fa687a03f50bf6665a8ba0244989d56df68ddb1a3d8a0ea85856020015160600151604051610e1d929190918252602082015260400190565b60405180910390a250505050565b6060610e35611ae0565b6040805160028082526060820183526000926020830190803683375050604080516002808252606082018352939450600093909250906020830190803683370190505090507370d95587d40a2caf56bd97485ab3eec10bee633682600081518110610ea257610ea2613a39565b60200260200101906001600160a01b031690816001600160a01b0316815250507370d95587d40a2caf56bd97485ab3eec10bee633682600181518110610eea57610eea613a39565b60200260200101906001600160a01b031690816001600160a01b0316815250507382af49447d8a07e3bd95bd0d56f35241523fbab181600081518110610f3257610f32613a39565b60200260200101906001600160a01b031690816001600160a01b03168152505073af88d065e77c8cc2239327c5edb3a432268e583181600181518110610f7a57610f7a613a39565b6001600160a01b039092166020928302919091019091015260405163c41b1ab360e01b8152737c68c7866a64fa2160f78eeae12217ffbf871fa89063c41b1ab390610fed90859085907f000000000000000000000000000000000000000000000000000000000000000090600401613a93565b6000604051808303816000875af115801561100c573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526110349190810190613ad1565b9250505090565b6007602052816000526040600020818154811061105757600080fd5b90600052602060002001600091509150505481565b60095460405163ac4ab3fb60e01b81523360048201527f97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b60248201526001600160a01b039091169063ac4ab3fb90604401602060405180830381865afa1580156110da573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110fe91906139f6565b61111a5760405162461bcd60e51b81526004016107f890613a13565b6000838152600660209081526040918290205491518581526001600160a01b039092169182917f175b8e2a72870f6a09b5857a688f0fcf564c52fab73b69a38e27d1f9345f8b0f910160405180910390a2604051637489ec2360e01b815260048101859052737c68c7866a64fa2160f78eeae12217ffbf871fa890637489ec2390602401600060405180830381600087803b1580156111b857600080fd5b505af11580156111cc573d6000803e3d6000fd5b5050505050505050565b6111de611ae0565b6112127382af49447d8a07e3bd95bd0d56f35241523fbab1337331ef83a530fde1b38ee9a18093a333d8bbbc40d584611da4565b604051634a393a4160e01b8152600090737c68c7866a64fa2160f78eeae12217ffbf871fa890634a393a419061124c908690600401613c88565b6020604051808303816000875af115801561126b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061128f91906139dd565b336000818152600760209081526040808320805460018101825590845282842001859055848352600682529182902080546001600160a01b031916841790558151848152878201359181019190915292935090917f1ef41cb56a21ca7ea86937ff0c915307d824dcde0cfe324ff1fb9d5449b9add9910160405180910390a2505050565b61131b611ae0565b6113256000611ddd565b565b6005546000908190600160a01b900460ff161561137b5760405162461bcd60e51b815260206004820152601260248201527110dbdb9d1c9858dd081a5cc81c185d5cd95960721b60448201526064016107f8565b61138584846118f7565b6502ba7def300060008461139887611e2f565b6113a2919061396b565b6113b490670de0b6b3a7640000613954565b905060006113c187611e2f565b6040805160e0808201835283825260208083018790526000838501819052606084018c905260808401899052622dc6c060a085015260c0840181905284516101a081018652600a80546001600160a01b03908116958301958652600b548116610100840152600c548116610120840152600d548116610140840152600e5416610160830152600f80548851818702810187019099528089529899509597929691958695949193610180870193928301828280156114a757602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311611489575b505050919092525050508152602081018490526040016004815260200160008152600060208201819052604082018190526060909101529050610969338a83611e40565b6114f3611ae0565b600980546001600160a01b031916733c3d99fd298f679dbc2cecd132b4ec4d0f5e6e721790556040805160c08101825230808252602082015260009181018290527370d95587d40a2caf56bd97485ab3eec10bee633660608201527382af49447d8a07e3bd95bd0d56f35241523fbab160808201529060a0820190604051908082528060200260200182016040528015611597578160200160208202803683370190505b5090528051600a80546001600160a01b03199081166001600160a01b03938416178255602080850151600b805484169186169190911790556040850151600c805484169186169190911790556060850151600d805484169186169190911790556080850151600e8054909316941693909317905560a08301518051919261162492600f929091019061238c565b505050565b60095460405163ac4ab3fb60e01b81523360048201527f97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b60248201526001600160a01b039091169063ac4ab3fb90604401602060405180830381865afa158015611697573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116bb91906139f6565b6116d75760405162461bcd60e51b81526004016107f890613a13565b6000838152600660205260409020546001600160a01b03166116f98482611c49565b600260208401515160078111156117125761171261398d565b036117c6576020830151606001516040516323b872dd60e01b81527331ef83a530fde1b38ee9a18093a333d8bbbc40d560048201526001600160a01b038316602482015260448101919091527382af49447d8a07e3bd95bd0d56f35241523fbab1906323b872dd906064016020604051808303816000875af115801561179c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117c091906139f6565b50611827565b600460208401515160078111156117df576117df61398d565b036118275782602001516040015160086000836001600160a01b03166001600160a01b0316815260200190815260200160002060008282546118219190613941565b90915550505b806001600160a01b03167f26b214029d2b6a3a3bb2ae7cc0a5d4c9329a86381429e16dc45b3633cf83d36985856020015160600151604051610e1d929190918252602082015260400190565b606060048054610988906139a3565b600033610a19818585611bea565b611898611ae0565b6005805460ff60a01b198116600160a01b9182900460ff1615909102179055565b6118c1611ae0565b6001600160a01b0381166118eb57604051631e4fbdf760e01b8152600060048201526024016107f8565b6118f481611ddd565b50565b600082116119405760405162461bcd60e51b8152602060048201526016602482015275125b9d985b1a590819195c1bdcda5d08185b5bdd5b9d60521b60448201526064016107f8565b60008111610b085760405162461bcd60e51b815260206004820152601860248201527f496e76616c69642061636365707461626c65207072696365000000000000000060448201526064016107f8565b6000806119c77382af49447d8a07e3bd95bd0d56f35241523fbab1857331ef83a530fde1b38ee9a18093a333d8bbbc40d588611da4565b604051634a393a4160e01b8152737c68c7866a64fa2160f78eeae12217ffbf871fa890634a393a41906119fe908690600401613d92565b6020604051808303816000875af1158015611a1d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a4191906139dd565b6001600160a01b0385166000818152600760209081526040808320805460018101825590845282842001859055848352600682529182902080546001600160a01b03191684179055868101515182518581529182015292945086935090917f1ef41cb56a21ca7ea86937ff0c915307d824dcde0cfe324ff1fb9d5449b9add991015b60405180910390a2935093915050565b6116248383836001612023565b6005546001600160a01b031633146113255760405163118cdaa760e01b81523360048201526024016107f8565b6040516001600160a01b0383811660248301526044820183905261162491859182169063a9059cbb906064015b604051602081830303815290604052915060e01b6020820180516001600160e01b0383818316178352505050506120f8565b6001600160a01b038381166000908152600160209081526040808320938616835292905220546000198114611be45781811015611bd557604051637dc7a0d960e11b81526001600160a01b038416600482015260248101829052604481018390526064016107f8565b611be484848484036000612023565b50505050565b6001600160a01b038316611c1457604051634b637e8f60e11b8152600060048201526024016107f8565b6001600160a01b038216611c3e5760405163ec442f0560e01b8152600060048201526024016107f8565b61162483838361215b565b600082815260066020908152604080832080546001600160a01b03191690556001600160a01b038416835260079091528120905b8154811015611be45783828281548110611c9957611c99613a39565b906000526020600020015403611d1f5781548290611cb990600190613941565b81548110611cc957611cc9613a39565b9060005260206000200154828281548110611ce657611ce6613a39565b906000526020600020018190555081805480611d0457611d04613eaf565b60019003818190600052602060002001600090559055611be4565b600101611c7d565b6000610a1f64e8d4a510008361396b565b6001600160a01b038216611d625760405163ec442f0560e01b8152600060048201526024016107f8565b610b086000838361215b565b6001600160a01b038216611d9857604051634b637e8f60e11b8152600060048201526024016107f8565b610b088260008361215b565b6040516001600160a01b038481166024830152838116604483015260648201839052611be49186918216906323b872dd90608401611b3a565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6000610a1f8264e8d4a51000613954565b6001600160a01b0383166000908152600860209081526040808320549183905282205482918591611e719190613941565b1015611eb65760405162461bcd60e51b8152602060048201526014602482015273496e73756666696369656e742062616c616e636560601b60448201526064016107f8565b6001600160a01b03851660009081526008602052604081208054869290611ede908490613ec5565b9091555050602083015160800151611f23907382af49447d8a07e3bd95bd0d56f35241523fbab19087907331ef83a530fde1b38ee9a18093a333d8bbbc40d590611da4565b604051634a393a4160e01b8152737c68c7866a64fa2160f78eeae12217ffbf871fa890634a393a4190611f5a908690600401613d92565b6020604051808303816000875af1158015611f79573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f9d91906139dd565b6001600160a01b0386166000818152600760209081526040808320805460018101825590845282842001859055848352600682529182902080546001600160a01b03191684179055868101515182518581529182015292945087935090917f6a079b9d4de97f4a995e0b57bb741b1b7250dd97d5e2a97cb37a07c3c66da41b9101611ac3565b6001600160a01b03841661204d5760405163e602df0560e01b8152600060048201526024016107f8565b6001600160a01b03831661207757604051634a1406b160e11b8152600060048201526024016107f8565b6001600160a01b0380851660009081526001602090815260408083209387168352929052208290558015611be457826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516120ea91815260200190565b60405180910390a350505050565b600061210d6001600160a01b03841683612285565b9050805160001415801561213257508080602001905181019061213091906139f6565b155b1561162457604051635274afe760e01b81526001600160a01b03841660048201526024016107f8565b6001600160a01b03831661218657806002600082825461217b9190613ec5565b909155506121f89050565b6001600160a01b038316600090815260208190526040902054818110156121d95760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016107f8565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b03821661221457600280548290039055612233565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161227891815260200190565b60405180910390a3505050565b6060610b2b8383600084600080856001600160a01b031684866040516122ab9190613ed8565b60006040518083038185875af1925050503d80600081146122e8576040519150601f19603f3d011682016040523d82523d6000602084013e6122ed565b606091505b50915091506122fd868383612307565b9695505050505050565b60608261231c5761231782612363565b610b2b565b815115801561233357506001600160a01b0384163b155b1561235c57604051639996b31560e01b81526001600160a01b03851660048201526024016107f8565b5080610b2b565b8051156123735780518082602001fd5b604051630a12f52160e11b815260040160405180910390fd5b8280548282559060005260206000209081019282156123e1579160200282015b828111156123e157825182546001600160a01b0319166001600160a01b039091161782556020909201916001909101906123ac565b506123ed9291506123f1565b5090565b5b808211156123ed57600081556001016123f2565b6000806040838503121561241957600080fd5b50508035926020909101359150565b60005b8381101561244357818101518382015260200161242b565b50506000910152565b602081526000825180602084015261246b816040850160208701612428565b601f01601f19169190910160400192915050565b80356001600160a01b038116811461249657600080fd5b919050565b600080604083850312156124ae57600080fd5b6124b78361247f565b946020939093013593505050565b6000602082840312156124d757600080fd5b610b2b8261247f565b6000806000606084860312156124f557600080fd5b6124fe8461247f565b925061250c6020850161247f565b9150604084013590509250925092565b634e487b7160e01b600052604160045260246000fd5b60405161014081016001600160401b03811182821017156125555761255561251c565b60405290565b604051606081016001600160401b03811182821017156125555761255561251c565b604080519081016001600160401b03811182821017156125555761255561251c565b60405160e081016001600160401b03811182821017156125555761255561251c565b604051601f8201601f191681016001600160401b03811182821017156125e9576125e961251c565b604052919050565b60006001600160401b0382111561260a5761260a61251c565b5060051b60200190565b600082601f83011261262557600080fd5b8135602061263a612635836125f1565b6125c1565b82815260059290921b8401810191818101908684111561265957600080fd5b8286015b8481101561267b5761266e8161247f565b835291830191830161265d565b509695505050505050565b80356008811061249657600080fd5b80356003811061249657600080fd5b600061014082840312156126b757600080fd5b6126bf612532565b90506126ca82612686565b81526126d860208301612695565b602082015260408201356040820152606082013560608201526080820135608082015260a082013560a082015260c082013560c082015260e082013560e082015261010080830135818301525061012080830135818301525092915050565b80151581146118f457600080fd5b803561249681612737565b60006060828403121561276257600080fd5b61276a61255b565b9050813561277781612737565b8152602082013561278781612737565b6020820152604082013561279a81612737565b604082015292915050565b600082601f8301126127b657600080fd5b81356001600160401b038111156127cf576127cf61251c565b6127e2601f8201601f19166020016125c1565b8181528460208386010111156127f757600080fd5b816020850160208301376000918101602001919091529392505050565b600082601f83011261282557600080fd5b81356020612835612635836125f1565b82815260059290921b8401810191818101908684111561285457600080fd5b8286015b8481101561267b5780356001600160401b03808211156128785760008081fd5b908801906040828b03601f19018113156128925760008081fd5b61289a61257d565b87840135838111156128ac5760008081fd5b6128ba8d8a838801016127a5565b8252509083013590828211156128d05760008081fd5b6128de8c8984870101612614565b818901528652505050918301918301612858565b6000604080838503121561290557600080fd5b61290d61257d565b915082356001600160401b038082111561292657600080fd5b818501915085601f83011261293a57600080fd5b8135602061294a612635836125f1565b82815260059290921b8401810191818101908984111561296957600080fd5b8286015b848110156129e3578035868111156129855760008081fd5b8701808c03601f190189131561299b5760008081fd5b6129a361257d565b85820135888111156129b55760008081fd5b6129c38e88838601016127a5565b8252506129d18a830161247f565b8187015284525091830191830161296d565b50875250868101359450828511156129fa57600080fd5b612a0688868901612814565b81870152505050505092915050565b600082601f830112612a2657600080fd5b81356020612a36612635836125f1565b828152600592831b8501820192828201919087851115612a5557600080fd5b8387015b85811015612b4a5780356001600160401b0380821115612a795760008081fd5b908901906040828c03601f1901811315612a935760008081fd5b612a9b61257d565b8884013583811115612aad5760008081fd5b612abb8e8b838801016127a5565b8252508184013583811115612ad05760008081fd5b8085019450508c603f850112612ae857600092508283fd5b888401359250612afa612635846125f1565b83815292861b8401820192898101908e851115612b175760008081fd5b948301945b84861015612b355785358252948a0194908a0190612b1c565b828b0152508752505050928401928401612a59565b5090979650505050505050565b60006040808385031215612b6a57600080fd5b612b7261257d565b915082356001600160401b0380821115612b8b57600080fd5b818501915085601f830112612b9f57600080fd5b81356020612baf612635836125f1565b82815260059290921b84018101918181019089841115612bce57600080fd5b8286015b84811015612c4057803586811115612bea5760008081fd5b8701808c03601f1901891315612c005760008081fd5b612c0861257d565b8582013588811115612c1a5760008081fd5b612c288e88838601016127a5565b82525090890135858201528352918301918301612bd2565b5087525086810135945082851115612c5757600080fd5b612a0688868901612a15565b600082601f830112612c7457600080fd5b81356020612c84612635836125f1565b828152600592831b8501820192828201919087851115612ca357600080fd5b8387015b85811015612b4a5780356001600160401b0380821115612cc75760008081fd5b908901906040828c03601f1901811315612ce15760008081fd5b612ce961257d565b8884013583811115612cfb5760008081fd5b612d098e8b838801016127a5565b8252508184013583811115612d1e5760008081fd5b8085019450508c603f850112612d3657600092508283fd5b888401359250612d48612635846125f1565b83815292861b8401820192898101908e851115612d655760008081fd5b948301945b84861015612d8f5785359350612d7f84612737565b838252948a0194908a0190612d6a565b828b0152508752505050928401928401612ca7565b60006040808385031215612db757600080fd5b612dbf61257d565b915082356001600160401b0380821115612dd857600080fd5b818501915085601f830112612dec57600080fd5b81356020612dfc612635836125f1565b82815260059290921b84018101918181019089841115612e1b57600080fd5b8286015b84811015612e9a57803586811115612e375760008081fd5b8701808c03601f1901891315612e4d5760008081fd5b612e5561257d565b8582013588811115612e675760008081fd5b612e758e88838601016127a5565b8252509089013590612e8682612737565b808601919091528352918301918301612e1f565b5087525086810135945082851115612eb157600080fd5b612a0688868901612c63565b600082601f830112612ece57600080fd5b81356020612ede612635836125f1565b828152600592831b8501820192828201919087851115612efd57600080fd5b8387015b85811015612b4a5780356001600160401b0380821115612f215760008081fd5b908901906040828c03601f1901811315612f3b5760008081fd5b612f4361257d565b8884013583811115612f555760008081fd5b612f638e8b838801016127a5565b8252508184013583811115612f785760008081fd5b8085019450508c603f850112612f9057600092508283fd5b888401359250612fa2612635846125f1565b83815292861b8401820192898101908e851115612fbf5760008081fd5b948301945b84861015612fdd5785358252948a0194908a0190612fc4565b828b0152508752505050928401928401612f01565b6000604080838503121561300557600080fd5b61300d61257d565b915082356001600160401b038082111561302657600080fd5b818501915085601f83011261303a57600080fd5b8135602061304a612635836125f1565b82815260059290921b8401810191818101908984111561306957600080fd5b8286015b848110156130db578035868111156130855760008081fd5b8701808c03601f190189131561309b5760008081fd5b6130a361257d565b85820135888111156130b55760008081fd5b6130c38e88838601016127a5565b8252509089013585820152835291830191830161306d565b50875250868101359450828511156130f257600080fd5b612a0688868901612ebd565b600082601f83011261310f57600080fd5b8135602061311f612635836125f1565b82815260059290921b8401810191818101908684111561313e57600080fd5b8286015b8481101561267b576001600160401b03808235111561316057600080fd5b813588016040818b03601f1901121561317857600080fd5b61318061257d565b868201358381111561319157600080fd5b61319f8c89838601016127a5565b8252506040820135838111156131b457600080fd5b8083019250508a603f8301126131c957600080fd5b868201356131d9612635826125f1565b81815260059190911b830160400190888101908d8311156131f957600080fd5b604085015b8381101561323157868135111561321457600080fd5b6132248f604083358901016127a5565b8352918a01918a016131fe565b50838a0152505085525050918301918301613142565b6000604080838503121561325a57600080fd5b61326261257d565b915082356001600160401b038082111561327b57600080fd5b818501915085601f83011261328f57600080fd5b8135602061329f612635836125f1565b82815260059290921b840181019181810190898411156132be57600080fd5b8286015b8481101561334e578035868111156132da5760008081fd5b8701808c03601f19018913156132f05760008081fd5b6132f861257d565b858201358881111561330a5760008081fd5b6133188e88838601016127a5565b825250898201358881111561332d5760008081fd5b61333b8e88838601016127a5565b82880152508452509183019183016132c2565b508752508681013594508285111561336557600080fd5b612a06888689016130fe565b600082601f83011261338257600080fd5b81356020613392612635836125f1565b82815260059290921b840181019181810190868411156133b157600080fd5b8286015b8481101561267b576001600160401b0380823511156133d357600080fd5b813588016040818b03601f190112156133eb57600080fd5b6133f361257d565b868201358381111561340457600080fd5b6134128c89838601016127a5565b82525060408201358381111561342757600080fd5b8083019250508a603f83011261343c57600080fd5b8682013561344c612635826125f1565b81815260059190911b830160400190888101908d83111561346c57600080fd5b604085015b838110156134a457868135111561348757600080fd5b6134978f604083358901016127a5565b8352918a01918a01613471565b50838a01525050855250509183019183016133b5565b600060408083850312156134cd57600080fd5b6134d561257d565b915082356001600160401b03808211156134ee57600080fd5b818501915085601f83011261350257600080fd5b81356020613512612635836125f1565b82815260059290921b8401810191818101908984111561353157600080fd5b8286015b848110156135c15780358681111561354d5760008081fd5b8701808c03601f19018913156135635760008081fd5b61356b61257d565b858201358881111561357d5760008081fd5b61358b8e88838601016127a5565b82525089820135888111156135a05760008081fd5b6135ae8e88838601016127a5565b8288015250845250918301918301613535565b50875250868101359450828511156135d857600080fd5b612a0688868901613371565b600060e082840312156135f657600080fd5b6135fe61259f565b905081356001600160401b038082111561361757600080fd5b613623858386016128f2565b8352602084013591508082111561363957600080fd5b61364585838601612b57565b6020840152604084013591508082111561365e57600080fd5b61366a85838601612b57565b6040840152606084013591508082111561368357600080fd5b61368f85838601612da4565b606084015260808401359150808211156136a857600080fd5b6136b485838601612ff2565b608084015260a08401359150808211156136cd57600080fd5b6136d985838601613247565b60a084015260c08401359150808211156136f257600080fd5b506136ff848285016134ba565b60c08301525092915050565b60008060006060848603121561372057600080fd5b8335925060208401356001600160401b038082111561373e57600080fd5b908501906101c0828803121561375357600080fd5b61375b61255b565b82358281111561376a57600080fd5b830160e0818a03121561377c57600080fd5b61378461259f565b61378d8261247f565b815261379b6020830161247f565b60208201526137ac6040830161247f565b60408201526137bd6060830161247f565b60608201526137ce6080830161247f565b60808201526137df60a0830161247f565b60a082015260c0820135848111156137f657600080fd5b6138028b828501612614565b60c08301525082525061381888602085016126a4565b602082015261382b886101608501612750565b604082015280945050604086013591508082111561384857600080fd5b50613855868287016135e4565b9150509250925092565b6020808252825182820181905260009190848201906040850190845b818110156138975783518352928401929184019160010161387b565b50909695505050505050565b600080604083850312156138b657600080fd5b82356001600160401b038111156138cc57600080fd5b83016101a081860312156124b757600080fd5b6000602082840312156138f157600080fd5b5035919050565b6000806040838503121561390b57600080fd5b6139148361247f565b91506139226020840161247f565b90509250929050565b634e487b7160e01b600052601160045260246000fd5b81810381811115610a1f57610a1f61392b565b8082028115828204841417610a1f57610a1f61392b565b60008261398857634e487b7160e01b600052601260045260246000fd5b500490565b634e487b7160e01b600052602160045260246000fd5b600181811c908216806139b757607f821691505b6020821081036139d757634e487b7160e01b600052602260045260246000fd5b50919050565b6000602082840312156139ef57600080fd5b5051919050565b600060208284031215613a0857600080fd5b8151610b2b81612737565b6020808252600c908201526b496e76616c696420726f6c6560a01b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b600081518084526020808501945080840160005b83811015613a885781516001600160a01b031687529582019590820190600101613a63565b509495945050505050565b606081526000613aa66060830186613a4f565b8281036020840152613ab88186613a4f565b91505060018060a01b0383166040830152949350505050565b60006020808385031215613ae457600080fd5b82516001600160401b03811115613afa57600080fd5b8301601f81018513613b0b57600080fd5b8051613b19612635826125f1565b81815260059190911b82018301908381019087831115613b3857600080fd5b928401925b82841015613b5657835182529284019290840190613b3d565b979650505050505050565b8183526000602080850194508260005b85811015613a88576001600160a01b03613b8a8361247f565b1687529582019590820190600101613b71565b60006001600160a01b0380613bb18461247f565b16845280613bc16020850161247f565b16602085015280613bd46040850161247f565b16604085015280613be76060850161247f565b16606085015280613bfa6080850161247f565b1660808501525060a0820135601e19833603018112613c1857600080fd5b82016020810190356001600160401b03811115613c3457600080fd5b8060051b3603821315613c4657600080fd5b60c060a0860152613c5b60c086018284613b61565b95945050505050565b60088110613c7457613c7461398d565b9052565b60038110613c7457613c7461398d565b602081526000823560be19843603018112613ca257600080fd5b6101a0806020850152613cbb6101c08501868401613b9d565b9150613d0c6040850160208701803582526020810135602083015260408101356040830152606081013560608301526080810135608083015260a081013560a083015260c081013560c08301525050565b613d196101008601612686565b610120613d2881870183613c64565b613d33818801612695565b915050610140613d4581870183613c78565b613d50818801612745565b915050610160613d638187018315159052565b613d6e818801612745565b915050610180613d818187018315159052565b959095013593019290925250919050565b602080825282516101a083830181905281516001600160a01b039081166101c08601529282015183166101e08501526040820151831661020085015260608201518316610220850152608082015190921661024084015260a0015160c0610260840152600091613e06610280850183613a4f565b91506020850151613e596040860182805182526020810151602083015260408101516040830152606081015160608301526080810151608083015260a081015160a083015260c081015160c08301525050565b506040850151613e6d610120860182613c64565b506060850151613e81610140860182613c78565b506080850151151561016085015260a0850151151561018085015260c0909401519390920192909252919050565b634e487b7160e01b600052603160045260246000fd5b80820180821115610a1f57610a1f61392b565b60008251613eea818460208701612428565b919091019291505056fea2646970667358221220eec9d3882270ac78c8f62e9ab7678079aeb8d70152c4d611263bde117390495964736f6c63430008140033",
        "deployedBytecode": "0x6080604052600436106102135760003560e01c806372abb1f9116101185780639d88d9da116100a0578063dd62ed3e1161006f578063dd62ed3e1461066e578063ddfa93de146106b4578063e336ac44146106e8578063e884214814610715578063f2fde38b1461078857600080fd5b80639d88d9da146105e9578063a9059cbb14610611578063ad5c464814610631578063c4ae31681461065957600080fd5b806389a30271116100e757806389a30271146105385780638da5cb5b1461056057806390cdaaba1461057e57806395d89b411461059e5780639c3f1e90146105b357600080fd5b806372abb1f9146104b357806375839cbe146104db5780638129fc1c146104fb5780638840d8601461051057600080fd5b80633df818611161019b5780635c975abb1161016a5780635c975abb1461040757806369e922241461042857806370a0823114610448578063710e429f1461047e578063715018a61461049e57600080fd5b80633df81861146103725780634a4a7b0414610392578063538ba4f9146103ca578063562a97e5146103df57600080fd5b806322a8b41e116101e257806322a8b41e146102d257806323b872dd146102f4578063299887dc146103145780632ef9425714610334578063313ce5671461035657600080fd5b8063032f8ac41461021f57806306fdde0314610261578063095ea7b31461028357806318160ddd146102b357600080fd5b3661021a57005b600080fd5b34801561022b57600080fd5b5061023f61023a366004612406565b6107a8565b604080519283526001600160a01b039091166020830152015b60405180910390f35b34801561026d57600080fd5b50610276610979565b604051610258919061244c565b34801561028f57600080fd5b506102a361029e36600461249b565b610a0b565b6040519015158152602001610258565b3480156102bf57600080fd5b506002545b604051908152602001610258565b3480156102de57600080fd5b506102f26102ed3660046124c5565b610a25565b005b34801561030057600080fd5b506102a361030f3660046124e0565b610b0c565b34801561032057600080fd5b506102f261032f36600461370b565b610b32565b34801561034057600080fd5b50610349610e2b565b604051610258919061385f565b34801561036257600080fd5b5060405160128152602001610258565b34801561037e57600080fd5b506102c461038d36600461249b565b61103b565b34801561039e57600080fd5b506009546103b2906001600160a01b031681565b6040516001600160a01b039091168152602001610258565b3480156103d657600080fd5b506103b2600081565b3480156103eb57600080fd5b506103b2737c68c7866a64fa2160f78eeae12217ffbf871fa881565b34801561041357600080fd5b506005546102a390600160a01b900460ff1681565b34801561043457600080fd5b506102f261044336600461370b565b61106c565b34801561045457600080fd5b506102c46104633660046124c5565b6001600160a01b031660009081526020819052604090205490565b34801561048a57600080fd5b506102f26104993660046138a3565b6111d6565b3480156104aa57600080fd5b506102f2611313565b3480156104bf57600080fd5b506103b2733c3d99fd298f679dbc2cecd132b4ec4d0f5e6e7281565b3480156104e757600080fd5b5061023f6104f6366004612406565b611327565b34801561050757600080fd5b506102f26114eb565b34801561051c57600080fd5b506103b27331ef83a530fde1b38ee9a18093a333d8bbbc40d581565b34801561054457600080fd5b506103b273af88d065e77c8cc2239327c5edb3a432268e583181565b34801561056c57600080fd5b506005546001600160a01b03166103b2565b34801561058a57600080fd5b506102f261059936600461370b565b611629565b3480156105aa57600080fd5b50610276611873565b3480156105bf57600080fd5b506103b26105ce3660046138df565b6006602052600090815260409020546001600160a01b031681565b3480156105f557600080fd5b506103b27370d95587d40a2caf56bd97485ab3eec10bee633681565b34801561061d57600080fd5b506102a361062c36600461249b565b611882565b34801561063d57600080fd5b506103b27382af49447d8a07e3bd95bd0d56f35241523fbab181565b34801561066557600080fd5b506102f2611890565b34801561067a57600080fd5b506102c46106893660046138f8565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b3480156106c057600080fd5b506103b27f000000000000000000000000000000000000000000000000000000000000000081565b3480156106f457600080fd5b506102c46107033660046124c5565b60086020526000908152604090205481565b34801561072157600080fd5b50600a54600b54600c54600d54600e5461074e946001600160a01b03908116948116938116928116911685565b604080516001600160a01b03968716815294861660208601529285169284019290925283166060830152909116608082015260a001610258565b34801561079457600080fd5b506102f26107a33660046124c5565b6118b9565b6005546000908190600160a01b900460ff16156108015760405162461bcd60e51b815260206004820152601260248201527110dbdb9d1c9858dd081a5cc81c185d5cd95960721b60448201526064015b60405180910390fd5b61080b84846118f7565b6502ba7def3000600061081e8287613941565b90506000670de0b6b3a76400006108358784613954565b61083f919061396b565b6040805160e0808201835283825260208083018790526000838501819052606084018c905260808401899052622dc6c060a085015260c0840181905284516101a081018652600a80546001600160a01b03908116958301958652600b548116610100840152600c548116610120840152600d548116610140840152600e5416610160830152600f805488518187028101870190995280895298995095979296919586959491936101808701939283018282801561092557602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311610907575b505050919092525050508152602081018490526040016002815260200160008152600060208201819052604082018190526060909101529050610969893383611990565b909a909950975050505050505050565b606060038054610988906139a3565b80601f01602080910402602001604051908101604052809291908181526020018280546109b4906139a3565b8015610a015780601f106109d657610100808354040283529160200191610a01565b820191906000526020600020905b8154815290600101906020018083116109e457829003601f168201915b5050505050905090565b600033610a19818585611ad3565b60019150505b92915050565b610a2d611ae0565b6040516370a0823160e01b81523060048201526000906001600160a01b038316906370a0823190602401602060405180830381865afa158015610a74573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a9891906139dd565b905060008111610ae25760405162461bcd60e51b81526020600482015260156024820152742737903130b630b731b2903a37903932b1b7bb32b960591b60448201526064016107f8565b610b08610af76005546001600160a01b031690565b6001600160a01b0384169083611b0d565b5050565b600033610b1a858285611b6c565b610b25858585611bea565b60019150505b9392505050565b60095460405163ac4ab3fb60e01b81523360048201527f97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b60248201526001600160a01b039091169063ac4ab3fb90604401602060405180830381865afa158015610ba0573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610bc491906139f6565b610be05760405162461bcd60e51b81526004016107f890613a13565b6000838152600660205260409020546001600160a01b0316610c028482611c49565b60026020840151516007811115610c1b57610c1b61398d565b03610c45576000610c33846020015160400151611d27565b9050610c3f8282611d38565b50610dd1565b60046020840151516007811115610c5e57610c5e61398d565b03610d9d576000610c76846020015160400151611d27565b6001600160a01b0383166000908152600860205260409020549091508111801590610cbf575080610cbc836001600160a01b031660009081526020819052604090205490565b10155b15610d4d57610cce8282611d6e565b602084015160600151610d1a907382af49447d8a07e3bd95bd0d56f35241523fbab1907f0000000000000000000000000000000000000000000000000000000000000000908590611da4565b6001600160a01b03821660009081526008602052604081208054839290610d42908490613941565b90915550610c3f9050565b60208401516060015160405130917f3b30d874a1731cd03fa687a03f50bf6665a8ba0244989d56df68ddb1a3d8a0ea91610d8f91898252602082015260400190565b60405180910390a250610dd1565b6040518481527fd14bd82cf43f48bfb6fe4d5349a8f9959e4c1c3f0a4520aeda92723a49c1989e9060200160405180910390a15b806001600160a01b03167f3b30d874a1731cd03fa687a03f50bf6665a8ba0244989d56df68ddb1a3d8a0ea85856020015160600151604051610e1d929190918252602082015260400190565b60405180910390a250505050565b6060610e35611ae0565b6040805160028082526060820183526000926020830190803683375050604080516002808252606082018352939450600093909250906020830190803683370190505090507370d95587d40a2caf56bd97485ab3eec10bee633682600081518110610ea257610ea2613a39565b60200260200101906001600160a01b031690816001600160a01b0316815250507370d95587d40a2caf56bd97485ab3eec10bee633682600181518110610eea57610eea613a39565b60200260200101906001600160a01b031690816001600160a01b0316815250507382af49447d8a07e3bd95bd0d56f35241523fbab181600081518110610f3257610f32613a39565b60200260200101906001600160a01b031690816001600160a01b03168152505073af88d065e77c8cc2239327c5edb3a432268e583181600181518110610f7a57610f7a613a39565b6001600160a01b039092166020928302919091019091015260405163c41b1ab360e01b8152737c68c7866a64fa2160f78eeae12217ffbf871fa89063c41b1ab390610fed90859085907f000000000000000000000000000000000000000000000000000000000000000090600401613a93565b6000604051808303816000875af115801561100c573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526110349190810190613ad1565b9250505090565b6007602052816000526040600020818154811061105757600080fd5b90600052602060002001600091509150505481565b60095460405163ac4ab3fb60e01b81523360048201527f97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b60248201526001600160a01b039091169063ac4ab3fb90604401602060405180830381865afa1580156110da573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110fe91906139f6565b61111a5760405162461bcd60e51b81526004016107f890613a13565b6000838152600660209081526040918290205491518581526001600160a01b039092169182917f175b8e2a72870f6a09b5857a688f0fcf564c52fab73b69a38e27d1f9345f8b0f910160405180910390a2604051637489ec2360e01b815260048101859052737c68c7866a64fa2160f78eeae12217ffbf871fa890637489ec2390602401600060405180830381600087803b1580156111b857600080fd5b505af11580156111cc573d6000803e3d6000fd5b5050505050505050565b6111de611ae0565b6112127382af49447d8a07e3bd95bd0d56f35241523fbab1337331ef83a530fde1b38ee9a18093a333d8bbbc40d584611da4565b604051634a393a4160e01b8152600090737c68c7866a64fa2160f78eeae12217ffbf871fa890634a393a419061124c908690600401613c88565b6020604051808303816000875af115801561126b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061128f91906139dd565b336000818152600760209081526040808320805460018101825590845282842001859055848352600682529182902080546001600160a01b031916841790558151848152878201359181019190915292935090917f1ef41cb56a21ca7ea86937ff0c915307d824dcde0cfe324ff1fb9d5449b9add9910160405180910390a2505050565b61131b611ae0565b6113256000611ddd565b565b6005546000908190600160a01b900460ff161561137b5760405162461bcd60e51b815260206004820152601260248201527110dbdb9d1c9858dd081a5cc81c185d5cd95960721b60448201526064016107f8565b61138584846118f7565b6502ba7def300060008461139887611e2f565b6113a2919061396b565b6113b490670de0b6b3a7640000613954565b905060006113c187611e2f565b6040805160e0808201835283825260208083018790526000838501819052606084018c905260808401899052622dc6c060a085015260c0840181905284516101a081018652600a80546001600160a01b03908116958301958652600b548116610100840152600c548116610120840152600d548116610140840152600e5416610160830152600f80548851818702810187019099528089529899509597929691958695949193610180870193928301828280156114a757602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311611489575b505050919092525050508152602081018490526040016004815260200160008152600060208201819052604082018190526060909101529050610969338a83611e40565b6114f3611ae0565b600980546001600160a01b031916733c3d99fd298f679dbc2cecd132b4ec4d0f5e6e721790556040805160c08101825230808252602082015260009181018290527370d95587d40a2caf56bd97485ab3eec10bee633660608201527382af49447d8a07e3bd95bd0d56f35241523fbab160808201529060a0820190604051908082528060200260200182016040528015611597578160200160208202803683370190505b5090528051600a80546001600160a01b03199081166001600160a01b03938416178255602080850151600b805484169186169190911790556040850151600c805484169186169190911790556060850151600d805484169186169190911790556080850151600e8054909316941693909317905560a08301518051919261162492600f929091019061238c565b505050565b60095460405163ac4ab3fb60e01b81523360048201527f97adf037b2472f4a6a9825eff7d2dd45e37f2dc308df2a260d6a72af4189a65b60248201526001600160a01b039091169063ac4ab3fb90604401602060405180830381865afa158015611697573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116bb91906139f6565b6116d75760405162461bcd60e51b81526004016107f890613a13565b6000838152600660205260409020546001600160a01b03166116f98482611c49565b600260208401515160078111156117125761171261398d565b036117c6576020830151606001516040516323b872dd60e01b81527331ef83a530fde1b38ee9a18093a333d8bbbc40d560048201526001600160a01b038316602482015260448101919091527382af49447d8a07e3bd95bd0d56f35241523fbab1906323b872dd906064016020604051808303816000875af115801561179c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117c091906139f6565b50611827565b600460208401515160078111156117df576117df61398d565b036118275782602001516040015160086000836001600160a01b03166001600160a01b0316815260200190815260200160002060008282546118219190613941565b90915550505b806001600160a01b03167f26b214029d2b6a3a3bb2ae7cc0a5d4c9329a86381429e16dc45b3633cf83d36985856020015160600151604051610e1d929190918252602082015260400190565b606060048054610988906139a3565b600033610a19818585611bea565b611898611ae0565b6005805460ff60a01b198116600160a01b9182900460ff1615909102179055565b6118c1611ae0565b6001600160a01b0381166118eb57604051631e4fbdf760e01b8152600060048201526024016107f8565b6118f481611ddd565b50565b600082116119405760405162461bcd60e51b8152602060048201526016602482015275125b9d985b1a590819195c1bdcda5d08185b5bdd5b9d60521b60448201526064016107f8565b60008111610b085760405162461bcd60e51b815260206004820152601860248201527f496e76616c69642061636365707461626c65207072696365000000000000000060448201526064016107f8565b6000806119c77382af49447d8a07e3bd95bd0d56f35241523fbab1857331ef83a530fde1b38ee9a18093a333d8bbbc40d588611da4565b604051634a393a4160e01b8152737c68c7866a64fa2160f78eeae12217ffbf871fa890634a393a41906119fe908690600401613d92565b6020604051808303816000875af1158015611a1d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611a4191906139dd565b6001600160a01b0385166000818152600760209081526040808320805460018101825590845282842001859055848352600682529182902080546001600160a01b03191684179055868101515182518581529182015292945086935090917f1ef41cb56a21ca7ea86937ff0c915307d824dcde0cfe324ff1fb9d5449b9add991015b60405180910390a2935093915050565b6116248383836001612023565b6005546001600160a01b031633146113255760405163118cdaa760e01b81523360048201526024016107f8565b6040516001600160a01b0383811660248301526044820183905261162491859182169063a9059cbb906064015b604051602081830303815290604052915060e01b6020820180516001600160e01b0383818316178352505050506120f8565b6001600160a01b038381166000908152600160209081526040808320938616835292905220546000198114611be45781811015611bd557604051637dc7a0d960e11b81526001600160a01b038416600482015260248101829052604481018390526064016107f8565b611be484848484036000612023565b50505050565b6001600160a01b038316611c1457604051634b637e8f60e11b8152600060048201526024016107f8565b6001600160a01b038216611c3e5760405163ec442f0560e01b8152600060048201526024016107f8565b61162483838361215b565b600082815260066020908152604080832080546001600160a01b03191690556001600160a01b038416835260079091528120905b8154811015611be45783828281548110611c9957611c99613a39565b906000526020600020015403611d1f5781548290611cb990600190613941565b81548110611cc957611cc9613a39565b9060005260206000200154828281548110611ce657611ce6613a39565b906000526020600020018190555081805480611d0457611d04613eaf565b60019003818190600052602060002001600090559055611be4565b600101611c7d565b6000610a1f64e8d4a510008361396b565b6001600160a01b038216611d625760405163ec442f0560e01b8152600060048201526024016107f8565b610b086000838361215b565b6001600160a01b038216611d9857604051634b637e8f60e11b8152600060048201526024016107f8565b610b088260008361215b565b6040516001600160a01b038481166024830152838116604483015260648201839052611be49186918216906323b872dd90608401611b3a565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6000610a1f8264e8d4a51000613954565b6001600160a01b0383166000908152600860209081526040808320549183905282205482918591611e719190613941565b1015611eb65760405162461bcd60e51b8152602060048201526014602482015273496e73756666696369656e742062616c616e636560601b60448201526064016107f8565b6001600160a01b03851660009081526008602052604081208054869290611ede908490613ec5565b9091555050602083015160800151611f23907382af49447d8a07e3bd95bd0d56f35241523fbab19087907331ef83a530fde1b38ee9a18093a333d8bbbc40d590611da4565b604051634a393a4160e01b8152737c68c7866a64fa2160f78eeae12217ffbf871fa890634a393a4190611f5a908690600401613d92565b6020604051808303816000875af1158015611f79573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f9d91906139dd565b6001600160a01b0386166000818152600760209081526040808320805460018101825590845282842001859055848352600682529182902080546001600160a01b03191684179055868101515182518581529182015292945087935090917f6a079b9d4de97f4a995e0b57bb741b1b7250dd97d5e2a97cb37a07c3c66da41b9101611ac3565b6001600160a01b03841661204d5760405163e602df0560e01b8152600060048201526024016107f8565b6001600160a01b03831661207757604051634a1406b160e11b8152600060048201526024016107f8565b6001600160a01b0380851660009081526001602090815260408083209387168352929052208290558015611be457826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516120ea91815260200190565b60405180910390a350505050565b600061210d6001600160a01b03841683612285565b9050805160001415801561213257508080602001905181019061213091906139f6565b155b1561162457604051635274afe760e01b81526001600160a01b03841660048201526024016107f8565b6001600160a01b03831661218657806002600082825461217b9190613ec5565b909155506121f89050565b6001600160a01b038316600090815260208190526040902054818110156121d95760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016107f8565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b03821661221457600280548290039055612233565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161227891815260200190565b60405180910390a3505050565b6060610b2b8383600084600080856001600160a01b031684866040516122ab9190613ed8565b60006040518083038185875af1925050503d80600081146122e8576040519150601f19603f3d011682016040523d82523d6000602084013e6122ed565b606091505b50915091506122fd868383612307565b9695505050505050565b60608261231c5761231782612363565b610b2b565b815115801561233357506001600160a01b0384163b155b1561235c57604051639996b31560e01b81526001600160a01b03851660048201526024016107f8565b5080610b2b565b8051156123735780518082602001fd5b604051630a12f52160e11b815260040160405180910390fd5b8280548282559060005260206000209081019282156123e1579160200282015b828111156123e157825182546001600160a01b0319166001600160a01b039091161782556020909201916001909101906123ac565b506123ed9291506123f1565b5090565b5b808211156123ed57600081556001016123f2565b6000806040838503121561241957600080fd5b50508035926020909101359150565b60005b8381101561244357818101518382015260200161242b565b50506000910152565b602081526000825180602084015261246b816040850160208701612428565b601f01601f19169190910160400192915050565b80356001600160a01b038116811461249657600080fd5b919050565b600080604083850312156124ae57600080fd5b6124b78361247f565b946020939093013593505050565b6000602082840312156124d757600080fd5b610b2b8261247f565b6000806000606084860312156124f557600080fd5b6124fe8461247f565b925061250c6020850161247f565b9150604084013590509250925092565b634e487b7160e01b600052604160045260246000fd5b60405161014081016001600160401b03811182821017156125555761255561251c565b60405290565b604051606081016001600160401b03811182821017156125555761255561251c565b604080519081016001600160401b03811182821017156125555761255561251c565b60405160e081016001600160401b03811182821017156125555761255561251c565b604051601f8201601f191681016001600160401b03811182821017156125e9576125e961251c565b604052919050565b60006001600160401b0382111561260a5761260a61251c565b5060051b60200190565b600082601f83011261262557600080fd5b8135602061263a612635836125f1565b6125c1565b82815260059290921b8401810191818101908684111561265957600080fd5b8286015b8481101561267b5761266e8161247f565b835291830191830161265d565b509695505050505050565b80356008811061249657600080fd5b80356003811061249657600080fd5b600061014082840312156126b757600080fd5b6126bf612532565b90506126ca82612686565b81526126d860208301612695565b602082015260408201356040820152606082013560608201526080820135608082015260a082013560a082015260c082013560c082015260e082013560e082015261010080830135818301525061012080830135818301525092915050565b80151581146118f457600080fd5b803561249681612737565b60006060828403121561276257600080fd5b61276a61255b565b9050813561277781612737565b8152602082013561278781612737565b6020820152604082013561279a81612737565b604082015292915050565b600082601f8301126127b657600080fd5b81356001600160401b038111156127cf576127cf61251c565b6127e2601f8201601f19166020016125c1565b8181528460208386010111156127f757600080fd5b816020850160208301376000918101602001919091529392505050565b600082601f83011261282557600080fd5b81356020612835612635836125f1565b82815260059290921b8401810191818101908684111561285457600080fd5b8286015b8481101561267b5780356001600160401b03808211156128785760008081fd5b908801906040828b03601f19018113156128925760008081fd5b61289a61257d565b87840135838111156128ac5760008081fd5b6128ba8d8a838801016127a5565b8252509083013590828211156128d05760008081fd5b6128de8c8984870101612614565b818901528652505050918301918301612858565b6000604080838503121561290557600080fd5b61290d61257d565b915082356001600160401b038082111561292657600080fd5b818501915085601f83011261293a57600080fd5b8135602061294a612635836125f1565b82815260059290921b8401810191818101908984111561296957600080fd5b8286015b848110156129e3578035868111156129855760008081fd5b8701808c03601f190189131561299b5760008081fd5b6129a361257d565b85820135888111156129b55760008081fd5b6129c38e88838601016127a5565b8252506129d18a830161247f565b8187015284525091830191830161296d565b50875250868101359450828511156129fa57600080fd5b612a0688868901612814565b81870152505050505092915050565b600082601f830112612a2657600080fd5b81356020612a36612635836125f1565b828152600592831b8501820192828201919087851115612a5557600080fd5b8387015b85811015612b4a5780356001600160401b0380821115612a795760008081fd5b908901906040828c03601f1901811315612a935760008081fd5b612a9b61257d565b8884013583811115612aad5760008081fd5b612abb8e8b838801016127a5565b8252508184013583811115612ad05760008081fd5b8085019450508c603f850112612ae857600092508283fd5b888401359250612afa612635846125f1565b83815292861b8401820192898101908e851115612b175760008081fd5b948301945b84861015612b355785358252948a0194908a0190612b1c565b828b0152508752505050928401928401612a59565b5090979650505050505050565b60006040808385031215612b6a57600080fd5b612b7261257d565b915082356001600160401b0380821115612b8b57600080fd5b818501915085601f830112612b9f57600080fd5b81356020612baf612635836125f1565b82815260059290921b84018101918181019089841115612bce57600080fd5b8286015b84811015612c4057803586811115612bea5760008081fd5b8701808c03601f1901891315612c005760008081fd5b612c0861257d565b8582013588811115612c1a5760008081fd5b612c288e88838601016127a5565b82525090890135858201528352918301918301612bd2565b5087525086810135945082851115612c5757600080fd5b612a0688868901612a15565b600082601f830112612c7457600080fd5b81356020612c84612635836125f1565b828152600592831b8501820192828201919087851115612ca357600080fd5b8387015b85811015612b4a5780356001600160401b0380821115612cc75760008081fd5b908901906040828c03601f1901811315612ce15760008081fd5b612ce961257d565b8884013583811115612cfb5760008081fd5b612d098e8b838801016127a5565b8252508184013583811115612d1e5760008081fd5b8085019450508c603f850112612d3657600092508283fd5b888401359250612d48612635846125f1565b83815292861b8401820192898101908e851115612d655760008081fd5b948301945b84861015612d8f5785359350612d7f84612737565b838252948a0194908a0190612d6a565b828b0152508752505050928401928401612ca7565b60006040808385031215612db757600080fd5b612dbf61257d565b915082356001600160401b0380821115612dd857600080fd5b818501915085601f830112612dec57600080fd5b81356020612dfc612635836125f1565b82815260059290921b84018101918181019089841115612e1b57600080fd5b8286015b84811015612e9a57803586811115612e375760008081fd5b8701808c03601f1901891315612e4d5760008081fd5b612e5561257d565b8582013588811115612e675760008081fd5b612e758e88838601016127a5565b8252509089013590612e8682612737565b808601919091528352918301918301612e1f565b5087525086810135945082851115612eb157600080fd5b612a0688868901612c63565b600082601f830112612ece57600080fd5b81356020612ede612635836125f1565b828152600592831b8501820192828201919087851115612efd57600080fd5b8387015b85811015612b4a5780356001600160401b0380821115612f215760008081fd5b908901906040828c03601f1901811315612f3b5760008081fd5b612f4361257d565b8884013583811115612f555760008081fd5b612f638e8b838801016127a5565b8252508184013583811115612f785760008081fd5b8085019450508c603f850112612f9057600092508283fd5b888401359250612fa2612635846125f1565b83815292861b8401820192898101908e851115612fbf5760008081fd5b948301945b84861015612fdd5785358252948a0194908a0190612fc4565b828b0152508752505050928401928401612f01565b6000604080838503121561300557600080fd5b61300d61257d565b915082356001600160401b038082111561302657600080fd5b818501915085601f83011261303a57600080fd5b8135602061304a612635836125f1565b82815260059290921b8401810191818101908984111561306957600080fd5b8286015b848110156130db578035868111156130855760008081fd5b8701808c03601f190189131561309b5760008081fd5b6130a361257d565b85820135888111156130b55760008081fd5b6130c38e88838601016127a5565b8252509089013585820152835291830191830161306d565b50875250868101359450828511156130f257600080fd5b612a0688868901612ebd565b600082601f83011261310f57600080fd5b8135602061311f612635836125f1565b82815260059290921b8401810191818101908684111561313e57600080fd5b8286015b8481101561267b576001600160401b03808235111561316057600080fd5b813588016040818b03601f1901121561317857600080fd5b61318061257d565b868201358381111561319157600080fd5b61319f8c89838601016127a5565b8252506040820135838111156131b457600080fd5b8083019250508a603f8301126131c957600080fd5b868201356131d9612635826125f1565b81815260059190911b830160400190888101908d8311156131f957600080fd5b604085015b8381101561323157868135111561321457600080fd5b6132248f604083358901016127a5565b8352918a01918a016131fe565b50838a0152505085525050918301918301613142565b6000604080838503121561325a57600080fd5b61326261257d565b915082356001600160401b038082111561327b57600080fd5b818501915085601f83011261328f57600080fd5b8135602061329f612635836125f1565b82815260059290921b840181019181810190898411156132be57600080fd5b8286015b8481101561334e578035868111156132da5760008081fd5b8701808c03601f19018913156132f05760008081fd5b6132f861257d565b858201358881111561330a5760008081fd5b6133188e88838601016127a5565b825250898201358881111561332d5760008081fd5b61333b8e88838601016127a5565b82880152508452509183019183016132c2565b508752508681013594508285111561336557600080fd5b612a06888689016130fe565b600082601f83011261338257600080fd5b81356020613392612635836125f1565b82815260059290921b840181019181810190868411156133b157600080fd5b8286015b8481101561267b576001600160401b0380823511156133d357600080fd5b813588016040818b03601f190112156133eb57600080fd5b6133f361257d565b868201358381111561340457600080fd5b6134128c89838601016127a5565b82525060408201358381111561342757600080fd5b8083019250508a603f83011261343c57600080fd5b8682013561344c612635826125f1565b81815260059190911b830160400190888101908d83111561346c57600080fd5b604085015b838110156134a457868135111561348757600080fd5b6134978f604083358901016127a5565b8352918a01918a01613471565b50838a01525050855250509183019183016133b5565b600060408083850312156134cd57600080fd5b6134d561257d565b915082356001600160401b03808211156134ee57600080fd5b818501915085601f83011261350257600080fd5b81356020613512612635836125f1565b82815260059290921b8401810191818101908984111561353157600080fd5b8286015b848110156135c15780358681111561354d5760008081fd5b8701808c03601f19018913156135635760008081fd5b61356b61257d565b858201358881111561357d5760008081fd5b61358b8e88838601016127a5565b82525089820135888111156135a05760008081fd5b6135ae8e88838601016127a5565b8288015250845250918301918301613535565b50875250868101359450828511156135d857600080fd5b612a0688868901613371565b600060e082840312156135f657600080fd5b6135fe61259f565b905081356001600160401b038082111561361757600080fd5b613623858386016128f2565b8352602084013591508082111561363957600080fd5b61364585838601612b57565b6020840152604084013591508082111561365e57600080fd5b61366a85838601612b57565b6040840152606084013591508082111561368357600080fd5b61368f85838601612da4565b606084015260808401359150808211156136a857600080fd5b6136b485838601612ff2565b608084015260a08401359150808211156136cd57600080fd5b6136d985838601613247565b60a084015260c08401359150808211156136f257600080fd5b506136ff848285016134ba565b60c08301525092915050565b60008060006060848603121561372057600080fd5b8335925060208401356001600160401b038082111561373e57600080fd5b908501906101c0828803121561375357600080fd5b61375b61255b565b82358281111561376a57600080fd5b830160e0818a03121561377c57600080fd5b61378461259f565b61378d8261247f565b815261379b6020830161247f565b60208201526137ac6040830161247f565b60408201526137bd6060830161247f565b60608201526137ce6080830161247f565b60808201526137df60a0830161247f565b60a082015260c0820135848111156137f657600080fd5b6138028b828501612614565b60c08301525082525061381888602085016126a4565b602082015261382b886101608501612750565b604082015280945050604086013591508082111561384857600080fd5b50613855868287016135e4565b9150509250925092565b6020808252825182820181905260009190848201906040850190845b818110156138975783518352928401929184019160010161387b565b50909695505050505050565b600080604083850312156138b657600080fd5b82356001600160401b038111156138cc57600080fd5b83016101a081860312156124b757600080fd5b6000602082840312156138f157600080fd5b5035919050565b6000806040838503121561390b57600080fd5b6139148361247f565b91506139226020840161247f565b90509250929050565b634e487b7160e01b600052601160045260246000fd5b81810381811115610a1f57610a1f61392b565b8082028115828204841417610a1f57610a1f61392b565b60008261398857634e487b7160e01b600052601260045260246000fd5b500490565b634e487b7160e01b600052602160045260246000fd5b600181811c908216806139b757607f821691505b6020821081036139d757634e487b7160e01b600052602260045260246000fd5b50919050565b6000602082840312156139ef57600080fd5b5051919050565b600060208284031215613a0857600080fd5b8151610b2b81612737565b6020808252600c908201526b496e76616c696420726f6c6560a01b604082015260600190565b634e487b7160e01b600052603260045260246000fd5b600081518084526020808501945080840160005b83811015613a885781516001600160a01b031687529582019590820190600101613a63565b509495945050505050565b606081526000613aa66060830186613a4f565b8281036020840152613ab88186613a4f565b91505060018060a01b0383166040830152949350505050565b60006020808385031215613ae457600080fd5b82516001600160401b03811115613afa57600080fd5b8301601f81018513613b0b57600080fd5b8051613b19612635826125f1565b81815260059190911b82018301908381019087831115613b3857600080fd5b928401925b82841015613b5657835182529284019290840190613b3d565b979650505050505050565b8183526000602080850194508260005b85811015613a88576001600160a01b03613b8a8361247f565b1687529582019590820190600101613b71565b60006001600160a01b0380613bb18461247f565b16845280613bc16020850161247f565b16602085015280613bd46040850161247f565b16604085015280613be76060850161247f565b16606085015280613bfa6080850161247f565b1660808501525060a0820135601e19833603018112613c1857600080fd5b82016020810190356001600160401b03811115613c3457600080fd5b8060051b3603821315613c4657600080fd5b60c060a0860152613c5b60c086018284613b61565b95945050505050565b60088110613c7457613c7461398d565b9052565b60038110613c7457613c7461398d565b602081526000823560be19843603018112613ca257600080fd5b6101a0806020850152613cbb6101c08501868401613b9d565b9150613d0c6040850160208701803582526020810135602083015260408101356040830152606081013560608301526080810135608083015260a081013560a083015260c081013560c08301525050565b613d196101008601612686565b610120613d2881870183613c64565b613d33818801612695565b915050610140613d4581870183613c78565b613d50818801612745565b915050610160613d638187018315159052565b613d6e818801612745565b915050610180613d818187018315159052565b959095013593019290925250919050565b602080825282516101a083830181905281516001600160a01b039081166101c08601529282015183166101e08501526040820151831661020085015260608201518316610220850152608082015190921661024084015260a0015160c0610260840152600091613e06610280850183613a4f565b91506020850151613e596040860182805182526020810151602083015260408101516040830152606081015160608301526080810151608083015260a081015160a083015260c081015160c08301525050565b506040850151613e6d610120860182613c64565b506060850151613e81610140860182613c78565b506080850151151561016085015260a0850151151561018085015260c0909401519390920192909252919050565b634e487b7160e01b600052603160045260246000fd5b80820180821115610a1f57610a1f61392b565b60008251613eea818460208701612428565b919091019291505056fea2646970667358221220eec9d3882270ac78c8f62e9ab7678079aeb8d70152c4d611263bde117390495964736f6c63430008140033",
        "linkReferences": {},
        "deployedLinkReferences": {}
      }
      
    // Your contract ABI here
];

async function testConnection() {
    try {
        // Connect to the contract
        const contract = new ethers.Contract(HEDGE_CONTRACT_ADDRESS, contractABI, ARBITRUM_URL);
        
        // Call a read-only function to test the connection
        // Replace 'getOwner' with any read-only function from your contract
        const owner = await contract.GMX_MARKET();
        
        console.log("Connected to the contract successfully.");
        console.log("Owner address:", owner);
    } catch (error) {
        console.error("Failed to connect to the contract:", error);
    }
}

testConnection();

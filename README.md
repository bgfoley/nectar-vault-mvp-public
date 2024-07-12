# Nectar Vault MVP

This repository contains the vault and strategy contracts for Nectar's Hedge MVP. The vault contract is an implementation of the ERC4626 standard and is based on Yearn V2 vaults, adapted from Vyper to Solidity.

## Project Overview

Nectar Vault MVP is designed to provide a robust and flexible vault system that can manage and distribute funds across various investment strategies. The primary goal is to offer a secure and efficient way to yield on deposited assets, with features adapted from Yearn Finance's proven model.

### Features

- **ERC4626 Compliance**: The vault contract follows the ERC4626 standard, ensuring compatibility with other DeFi protocols.
- **Strategy Integration**: Easily integrate various investment strategies to optimize returns.
- **Customizable Parameters**: Managers can customize strategies, accountants, roles, and more to fit specific needs.

### Documentation

[View the Documentation for Hedge](docs/Hedge.md)

### References

Docs for the GMX v2 contracts found in this repo's libraries and interfaces directories: https://gmx-docs.io/docs/api/contracts-v2/

Chainlink contracts

### Work In Progress

This are currently in development. Progress thus far:
- Demonstrate minimum viable functionality. 
    - Hedge contract successfully creates orders on GMX to open and close positions
    - Hedge mints and burns corresponding vault tokens according to order parameters
- To Do
   - **Contracts**:
    - Integrate Vault.sol (ERC4626) with strategy (HEDGE)
    - Hedge will have mint/burn access to Vault
    - Intergrate DataReader with Strategy and Vault
    - DataReader interfaces with GMX to pull main account data and ensure accurate share calculation
    - DataReader interface with Vault for previewMint and other functions
    - Derive reusable strategy contract from Hedge.sol
   - **Scripts**:
    - Debug order parameters for UnHedge
    - Cleanup file naming 
   - **Tests**:
    - Cleanup directory and file naming
    - Full coverage on all contracts
    - Use Foundry for fuzzing



## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Hardhat](https://hardhat.org/)

### Installation

1. Clone the repository:

   ```sh
   git clone git@github.com:bgfoley/NECTAR_VAULT_MVP.git
   cd NECTAR_VAULT_MVP

2. Install dependencies:

    ```sh
    npm install

### Collaboration
We welcome collaboration from developers and contributors who are interested in improving the Nectar Vault MVP. To get involved:

1. Fork the repository and create your branch from main.
2. Commit your changes: git commit -m 'Add some feature'.
3. Push to your branch: git push origin my-new-feature.
4. Create a new Pull Request.

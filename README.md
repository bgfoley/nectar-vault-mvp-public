# Nectar Vault MVP

This repository contains the vault and strategy contracts for Nectar's Hedge MVP. The vault contract is an implementation of the ERC4626 standard and is based on Yearn V2 vaults, adapted from Vyper to Solidity.

## Project Overview

Nectar Vault MVP is designed to provide a robust and flexible vault system that can manage and distribute funds across various investment strategies. The primary goal is to offer a secure and efficient way to yield on deposited assets, with features adapted from Yearn Finance's proven model.

### Features

- **ERC4626 Compliance**: The vault contract follows the ERC4626 standard, ensuring compatibility with other DeFi protocols.
- **Strategy Integration**: Easily integrate various investment strategies to optimize returns.
- **Adapted from Yearn V2**: Leveraging the strengths of Yearn V2 vaults, translated from Vyper to Solidity for broader developer accessibility.
- **Customizable Parameters**: Managers can customize strategies, accountants, roles, and more to fit specific needs.

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

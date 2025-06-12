<p align="center">
  <img alt="GameBuild" width="64" height="64" src="logo.svg"/>
</p>

<p align="center">
  <a href="https://layerzero.network" style="color: #a77dff">LayerZero Homepage</a> | <a href="https://docs.layerzero.network/" style="color: #a77dff">LayerZero Docs</a>
</p>

<h1 align="center">GameBuild Token OFT Adapter</h1>

<p align="center">
  <b>Omnichain Fungible Token (OFT) Adapter for the GameBuild ecosystem, powered by LayerZero V2.</b>
</p>

---

## Overview

This repository contains the contracts, deployment scripts, and configuration for the GameBuild Token OFT Adapter, enabling omnichain token transfers using LayerZero's OFT standard.

- **OFTAdapter**: Adapts an ERC20 token to be omnichain-compatible via LayerZero.
- **GameBuild Token**: The main token for the GameBuild ecosystem, supporting cross-chain transfers.

## Quickstart

### 1. Install dependencies

We recommend using `pnpm`:

```bash
pnpm install
```

### 2. Compile contracts

```bash
pnpm compile
```

### 3. Configure deployment

Edit your `hardhat.config.ts` and add the following to the target network:

```typescript
oftAdapter: {
    tokenAddress: '0xYourGameBuildTokenAddress',
}
```

### 4. Set up deployer

- Copy `.env.example` to `.env` and fill in your mnemonic or private key.
- Fund your deployer address with native tokens for the target chain.

### 5. Deploy contracts

```bash
npx hardhat deploy --tags GameBuildOFTAdapter --network <network>
```

### 6. Verify contracts

After deployment, verify your contracts on Etherscan:

```bash
npx hardhat verify --network <network> <contract_address> <constructor_args>
```

---

## Testing

You can run tests using:

```bash
pnpm test
```

---

## Resources

- [LayerZero Docs](https://docs.layerzero.network/)
- [OFT Adapter Guide](https://docs.layerzero.network/v2/developers/evm/oft/adapter)
- [GameBuild Website](https://game.build) 

---
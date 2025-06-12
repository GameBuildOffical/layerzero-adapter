// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import "@nomicfoundation/hardhat-verify";
import '@layerzerolabs/toolbox-hardhat'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

import './type-extensions'

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}


const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    sourcify: {
        enabled: true
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        'mainnet': {
            eid: EndpointId.ETHEREUM_V2_MAINNET,
            toEid: EndpointId.BSC_V2_MAINNET,
            url: process.env.RPC_URL_MAINNET || 'https://rpc.mevblocker.io',
            accounts,
            token: {
                tokenAddress: '0x825459139C897D769339f295E962396C4F9E4A4D', // Set the token address for the Test Token

            },
            gasMultiplier: 1.2,
            oftAdapter: {
                tokenAddress: '', // Set the token address for the OFT adapter
            },
        },
        'bsc': {
            gasMultiplier: 1.2,
            eid: EndpointId.BSC_V2_MAINNET,
            toEid: EndpointId.ETHEREUM_V2_MAINNET,
            url: process.env.RPC_URL_BNB || 'https://bsc-dataseed1.bnbchain.org',
            accounts,
            oftAdapter: {
                tokenAddress: '', // Set the token address for the OFT adapter
            },
        },
        hardhat: {
            // Need this for testing because TestHelperOz5.sol is exceeding the compiled contract size limit
            allowUnlimitedContractSize: true,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
    etherscan: {
        apiKey: {
            'bsc': '375D382JZ7GPDZHP6VT97GZXUBKFM2B6YR',
            'mainnet': 'CS5DCVQW1X7PSMWIUHM3DSJB4GB2MS7VRR',
        }
    },
}

export default config

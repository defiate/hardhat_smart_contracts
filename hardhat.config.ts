import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-etherscan"
import "hardhat-gas-reporter"
import "dotenv/config"
import "hardhat-deploy"
import { ethers } from "ethers"
import fs from "fs-extra"

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const ETHEREUM_ALCHEMY = process.env.ETHEREUM_ALCHEMY || "key"
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

export let PRIVATE_KEY: string
const PASSWORD: string = process.env.WAL_PASS || "No pass provided"

if (PASSWORD != "No pass provided") {
    const encryptedJson =
        fs.readFileSync("./encrypted-publicTest.json", "utf8") || "emptry"
    PRIVATE_KEY = ethers.Wallet.fromEncryptedJsonSync(
        encryptedJson,
        PASSWORD
    ).privateKey
} else if (process.env.PRIVATE_KEY) {
    PRIVATE_KEY = process.env.PRIVATE_KEY
} else {
    PRIVATE_KEY =
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
}

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.10",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000000,
                    },
                },
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            forking: {
                url: GOERLI_RPC_URL,
                // url: ETHEREUM_ALCHEMY,
                // blockNumber: 3627190,
            },
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
        },
    },
    gasReporter: {
        // enabled: true,
        // outputFile: "gas-report.txt",
        // noColors: true,
        currency: "USD",
        // coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}

export default config

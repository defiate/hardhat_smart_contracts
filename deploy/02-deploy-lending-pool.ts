import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { PeggedTurkishLira } from "../typechain-types"
import verify from "../utils/verify"
import { mockAggregatorAddress } from "./00-deploy-mocks"
import { pTRYTokenAddress } from "./01-deploy-pTRY-token"

export let LendingPoolAddress: string
const deployLendingPool: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, ethers, network } = hre
    const { deploy, log } = deployments

    const deployer = (await ethers.getSigners())[0]
    log(`The deployer address is: ${deployer.address}`)

    const chainId = network.config.chainId

    let args: any = [pTRYTokenAddress, mockAggregatorAddress]
    log("Deploying LendingPool and waiting for confirmations...")
    const lendingPool = await deploy("LendingPool", {
        from: deployer.address,
        log: true,
        args: args,
        waitConfirmations: 1,
    })
    const token = (await ethers.getContract(
        "PeggedTurkishLira",
        deployer
    )) as PeggedTurkishLira
    await token.grantRole(
        "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
        lendingPool.address
    )
    LendingPoolAddress = lendingPool.address
    log(`myERC20Votes deployed at ${lendingPool.address}`)
    log("__________________________________________________")

    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        // verify the code
        await verify(lendingPool.address, args)
    }
}

export default deployLendingPool
deployLendingPool.tags = ["all", "LendingPool"]

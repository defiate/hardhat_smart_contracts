import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
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
    const LendingPool = await deploy("LendingPool", {
        from: deployer.address,
        log: true,
        args: args,
        waitConfirmations: 1,
    })
    LendingPoolAddress = LendingPool.address
    log(`myERC20Votes deployed at ${LendingPool.address}`)
    log("__________________________________________________")

    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        // verify the code
        await verify(LendingPool.address, args)
    }
}

export default deployLendingPool
deployLendingPool.tags = ["all", "LendingPool"]

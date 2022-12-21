import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import verify from "../utils/verify"

export let mockAggregatorAddress: string
const deployMockAggregator: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, ethers, network } = hre
    const { deploy, log } = deployments

    const deployer = (await ethers.getSigners())[0]
    log(`The deployer address is: ${deployer.address}`)

    const chainId = network.config.chainId

    let args: any = []
    log("Deploying MockAggregator and waiting for confirmations...")
    const mockAggregator = await deploy("MockAggregator", {
        from: deployer.address,
        log: true,
        args: args,
        waitConfirmations: 1,
    })
    mockAggregatorAddress = mockAggregator.address
    log(`MockAggregator deployed at ${mockAggregator.address}`)
    log("__________________________________________________")

    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        // verify the code
        await verify(mockAggregator.address, args)
    }
}

export default deployMockAggregator
deployMockAggregator.tags = ["all", "MockAggregator"]

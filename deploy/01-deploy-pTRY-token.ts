import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import verify from "../utils/verify"

export let pTRYTokenAddress: string
const deployPTRYToken: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, ethers, network } = hre
    const { deploy, log } = deployments

    const deployer = (await ethers.getSigners())[0]
    log(`The deployer address is: ${deployer.address}`)

    const chainId = network.config.chainId

    let args: any = []
    log("Deploying PTRYToken and waiting for confirmations...")
    const pTRYToken = await deploy("PeggedTurkishLira", {
        from: deployer.address,
        log: true,
        args: args,
        waitConfirmations: 5,
    })
    pTRYTokenAddress = pTRYToken.address
    log(`myERC20Votes deployed at ${pTRYToken.address}`)
    log("__________________________________________________")

    if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
        // verify the code
        await verify(pTRYToken.address, args)
    }
}

export default deployPTRYToken
deployPTRYToken.tags = ["all", "PTRYToken"]

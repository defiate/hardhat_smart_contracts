import { expect } from "chai"
import { deployments, ethers, network } from "hardhat"
import {
    MockAggregator,
    PeggedTurkishLira,
    LendingPool,
} from "../../typechain-types/"
import { abi as IERC20JSON } from "@openzeppelin/contracts-v0.7/build/contracts/IERC20.json"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

const minAmount = "10000000000"
describe("lottery unit test", function () {
    let lendingPool: LendingPool,
        oracle: MockAggregator,
        TRKToken: PeggedTurkishLira,
        DaiToken,
        deployer: SignerWithAddress

    const chainId = network.config.chainId

    beforeEach(async function () {
        deployer = (await ethers.getSigners())[0]
        await deployments.fixture(["all"])
        oracle = (await ethers.getContract(
            "MockAggregator",
            deployer
        )) as MockAggregator
        TRKToken = (await ethers.getContract(
            "PeggedTurkishLira",
            deployer
        )) as PeggedTurkishLira
        lendingPool = (await ethers.getContract(
            "LendingPool",
            deployer
        )) as LendingPool
        DaiToken = await ethers.getContractAt(
            IERC20JSON,
            "0xDF1742fE5b0bFc12331D8EAec6b478DfDbD31464",
            deployer
        )
        await DaiToken.approve(lendingPool.address, minAmount)
    })

    describe("lendingPool tests", function () {
        it("Initializes the lottery state correctly", async function () {
            await lendingPool.mintPTRY(minAmount)
            const trkBalance = await TRKToken.balanceOf(deployer.address)
            const ratio = await lendingPool.getRate()
            await oracle.setLatestAnswer("10000000000")
            const checkLiquidation = await lendingPool.checkLiquidation()
            console.log(checkLiquidation)
        })
    })
})

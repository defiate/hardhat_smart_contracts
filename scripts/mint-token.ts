import { deployments, ethers } from "hardhat"
import { abi as IERC20JSON } from "@openzeppelin/contracts-v0.7/build/contracts/IERC20.json"
import {
    LendingPool,
    MockAggregator,
    PeggedTurkishLira,
} from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

const minAmount = "10000000000"
const main = async function () {
    let lendingPool: LendingPool,
        oracle: MockAggregator,
        TRKToken: PeggedTurkishLira,
        DaiToken,
        deployer: SignerWithAddress

    deployer = (await ethers.getSigners())[0]
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
    let tx = await DaiToken.approve(lendingPool.address, minAmount)
    tx.wait()
    tx = await lendingPool.mintPTRY(minAmount)
    tx.wait()
    const trkBalance = await TRKToken.balanceOf(deployer.address)
    const ratio = await lendingPool.getRate()
    tx = await oracle.setLatestAnswer("1000000000000000000")
    tx.wait()
    const checkLiquidation = await lendingPool.checkLiquidation()
    console.log(checkLiquidation)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

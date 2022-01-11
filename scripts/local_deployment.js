const hre = require("hardhat")
const fs = require('fs')
const params = require('./params/local_deployment_params')
const assert = require('assert')

async function main() {
    const deployer = (await ethers.getSigners())[0]
    assert.equal(deployer.address, params.DEPLOYER_ADDR)

    let deploymentRecord = {}
    console.log(`contracts deployer: ${deployer.address}`)
    console.log('account balance: ', (await deployer.getBalance()).toString())

    let erc20 = await deploy("MockErc20Token", deployer, deploymentRecord)
    let zksCore = await deploy("MockZksCore", deployer, deploymentRecord)
    let zksTreasury = await deploy("ZksTreasury", deployer, deploymentRecord, [params.RECEIVER_L2_ADDR, params.RECHARGE_WORKER_ADDR, zksCore.address])

    await zksCore.setZksTreasuryAddress(zksTreasury.address)
    await saveOutputFile(deploymentRecord, params.OUTPUT_FILE)
}

async function deploy(name, signer, deploymentRecord, params = []) {
    const factory = await hre.ethers.getContractFactory(name, signer)
    const contract = await factory.deploy(...params)
    await contract.deployed()
    deploymentRecord[name] = contract.address
    console.log(`${name} address: `, contract.address)
    return contract
}

async function saveOutputFile(deploymentRecord, filePath) {
    const contentJSON = JSON.stringify(deploymentRecord, null, 2)
    fs.writeFileSync(filePath, contentJSON)
    console.log(contentJSON)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

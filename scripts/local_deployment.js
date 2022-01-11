const hre = require("hardhat");
const params = require('./params/local_deployment_params')

async function main() {
    const deployer = (await ethers.getSigners())[0]
    let deploymentRecord = {}
    console.log(`contracts deployer: ${deployer.address}`)
    console.log('account balance: ', (await deployer.getBalance()).toString())

    await deploy("MockErc20Token", deployer, deploymentRecord)

    console.log(deploymentRecord)

}

async function deploy(name, signer, deploymentRecord, params = []) {
    const factory = await hre.ethers.getContractFactory(name, signer)
    const contract = await factory.deploy(...params)
    await contract.deployed()
    deploymentRecord[name] = contract.address
    console.log(`${name} address: `, contract.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

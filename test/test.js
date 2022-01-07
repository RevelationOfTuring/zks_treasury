const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("ZKSTreasury", function () {
    let mockZkCore, erc20Token, zksTreasury
    let deployer, receiverL2
    let maxEthDeposit = "100"

    before(async () => {
        [deployer, receiverL2] = await ethers.getSigners()
        console.log('deployer address: ' + deployer.address)
        console.log('receiver on layer 2 address: ' + receiverL2.address)
        const MockZkCore = await ethers.getContractFactory("MockZKCore")
        const Erc20Token = await ethers.getContractFactory("MockErc20Token")
        const ZKSTreasury = (await ethers.getContractFactory("ZKSTreasury")).connect(deployer)

        mockZkCore = await MockZkCore.deploy()
        erc20Token = await Erc20Token.deploy()
        await mockZkCore.deployed()
        await erc20Token.deployed()
        console.log('mock ZkCore contract: ' + mockZkCore.address)
        console.log('mock Erc20 contract: ' + erc20Token.address)

        zksTreasury = await ZKSTreasury.deploy(maxEthDeposit, receiverL2.address, mockZkCore.address)
        await zksTreasury.deployed()
        console.log('zks treasury contract: ' + zksTreasury.address)

        expect(await zksTreasury.owner()).to.equal(deployer.address)
        expect(await zksTreasury.zkCoreAddress()).to.equal(mockZkCore.address)
        expect(await zksTreasury.receiverLayer2()).to.equal(receiverL2.address)
    })

    it("common test", async function () {

    })
});

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();
//
//     expect(await greeter.greet()).to.equal("Hello, world!");
//
//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");
//
//     // wait until the transaction is mined
//     await setGreetingTx.wait();
//
//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });

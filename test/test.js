const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("ZKSTreasury", function () {
    let mockZkCore, erc20Token, zksTreasury
    let deployer, receiverL2, user

    before(async () => {
        [deployer, receiverL2, user] = await ethers.getSigners()
        console.log(`deployer address: ${deployer.address}`)
        console.log(`receiver on layer 2 address: ${receiverL2.address}`)
        console.log(`user address: ${user.address}`)
        console.log('deployer eth balance: ' + await ethers.provider.getBalance(deployer.address))
        const MockZkCore = await ethers.getContractFactory("MockZKCore")
        const Erc20Token = await ethers.getContractFactory("MockErc20Token")
        const ZKSTreasury = (await ethers.getContractFactory("ZKSTreasury")).connect(deployer)

        mockZkCore = await MockZkCore.deploy()
        erc20Token = await Erc20Token.deploy()
        await mockZkCore.deployed()
        await erc20Token.deployed()
        console.log(`mock ZkCore contract: ${mockZkCore.address}`)
        console.log(`mock Erc20 contract: ${erc20Token.address}`)

        zksTreasury = await ZKSTreasury.deploy(receiverL2.address, mockZkCore.address)
        await zksTreasury.deployed()
        console.log(`zks treasury contract: ${zksTreasury.address}`)

        expect(await zksTreasury.owner()).to.equal(deployer.address)
        expect(await zksTreasury.zkCoreAddress()).to.equal(mockZkCore.address)
        expect(await zksTreasury.receiverLayer2()).to.equal(receiverL2.address)
        console.log('deployer eth balance: ' + await ethers.provider.getBalance(deployer.address))
    })

    it("erc20 init", async () => {
        expect(await erc20Token.balanceOf(deployer.address)).to.equal(0)
        await erc20Token.mintDirectly(user.address, '1000')
        await erc20Token.mintDirectly(deployer.address, '1000')
        expect(await erc20Token.balanceOf(user.address)).to.equal(1000)
        expect(await erc20Token.balanceOf(deployer.address)).to.equal(1000)
    })

    it("trasfer erc20 to treasury", async () => {
        let erc20Balance = await erc20Token.balanceOf(user.address)
        await erc20Token.connect(user).transfer(zksTreasury.address, 100)
        expect(await erc20Token.balanceOf(user.address)).to.equal(erc20Balance - 100)
        expect(await erc20Token.balanceOf(zksTreasury.address)).to.equal(100)

        expect(await mockZkCore.isDepositERC20Invoked()).to.equal(false)
        await expect(zksTreasury.connect(user).depositErc20ToZKCore([erc20Token.address], [1])).
        to.be.revertedWith('Ownable: caller is not the owner')

        await expect(zksTreasury.connect(deployer).depositErc20ToZKCore([erc20Token.address], [1, 2])).
        to.be.revertedWith('unmatched length')

        await zksTreasury.depositErc20ToZKCore([erc20Token.address], [1])
        expect(await mockZkCore.isDepositERC20Invoked()).to.equal(true)
    })
});
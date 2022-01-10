const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("ZksTreasury", function () {
    let mockZksCore, erc20Token, zksTreasury
    let deployer, rechargeWorker, receiverL2, user

    beforeEach(async () => {
        [deployer, rechargeWorker, receiverL2, user] = await ethers.getSigners()
        console.log(`deployer address: ${deployer.address}`)
        console.log(`receiver on layer 2 address: ${receiverL2.address}`)
        console.log(`recharge worker address: ${rechargeWorker.address}`)
        console.log(`user address: ${user.address}`)
        console.log('deployer eth balance: ' + await ethers.provider.getBalance(deployer.address))
        const MockZksCore = await ethers.getContractFactory("MockZksCore")
        const Erc20Token = await ethers.getContractFactory("MockErc20Token")
        const ZksTreasury = (await ethers.getContractFactory("ZksTreasury")).connect(deployer)

        mockZksCore = await MockZksCore.deploy()
        erc20Token = await Erc20Token.deploy()
        await mockZksCore.deployed()
        await erc20Token.deployed()
        console.log(`mock ZksCore contract: ${mockZksCore.address}`)
        console.log(`mock Erc20 contract: ${erc20Token.address}`)

        zksTreasury = await ZksTreasury.deploy(receiverL2.address, rechargeWorker.address, mockZksCore.address)
        await zksTreasury.deployed()
        console.log(`zks treasury contract: ${zksTreasury.address}`)
        await mockZksCore.setZksTreasuryAddress(zksTreasury.address)

        expect(await zksTreasury.owner()).to.equal(deployer.address)
        expect(await zksTreasury.zksCoreAddress()).to.equal(mockZksCore.address)
        expect(await zksTreasury.receiverLayer2()).to.equal(receiverL2.address)
        expect(await zksTreasury.rechargeWorker()).to.equal(rechargeWorker.address)
        console.log('deployer eth balance: ' + await ethers.provider.getBalance(deployer.address))
    })

    it("variable setter", async () => {
        await zksTreasury.setReceiverLayer2(user.address)
        expect(await zksTreasury.receiverLayer2()).to.equal(user.address)

        await zksTreasury.setZksCoreAddress(user.address)
        expect(await zksTreasury.zksCoreAddress()).to.equal(user.address)

        await zksTreasury.setRechargeWorker(user.address)
        expect(await zksTreasury.rechargeWorker()).to.equal(user.address)
    })

    it("erc20 init", async () => {
        expect(await erc20Token.balanceOf(deployer.address)).to.equal(0)
        await erc20Token.mintDirectly(user.address, '1000')
        await erc20Token.mintDirectly(deployer.address, '1000')
        expect(await erc20Token.balanceOf(user.address)).to.equal(1000)
        expect(await erc20Token.balanceOf(deployer.address)).to.equal(1000)
    })

    it("transfer erc20 to treasury", async () => {
        await erc20Token.mintDirectly(user.address, '1000')
        await erc20Token.mintDirectly(rechargeWorker.address, '1000')
        let erc20Balance = await erc20Token.balanceOf(user.address)
        await erc20Token.connect(user).transfer(zksTreasury.address, 100)
        expect(await erc20Token.balanceOf(user.address)).to.equal(erc20Balance - 100)
        expect(await erc20Token.balanceOf(zksTreasury.address)).to.equal(100)

        expect(await mockZksCore.isDepositERC20Invoked()).to.equal(false)

        await expect(zksTreasury.connect(user).depositErc20ToZksCore([erc20Token.address], [1])).to.be.revertedWith('not recharge worker')

        await expect(zksTreasury.connect(rechargeWorker).depositErc20ToZksCore([erc20Token.address], [1, 2])).to.be.revertedWith('unmatched length')

        await expect(zksTreasury.connect(rechargeWorker).depositErc20ToZksCore([erc20Token.address], [1])).to.be.revertedWith('insufficient allowance')

        // approve erc20 to treasury
        await expect(zksTreasury.approveToZksCore([erc20Token.address], [1, 2])).to.be.revertedWith('unmatched length')

        await expect(zksTreasury.connect(rechargeWorker).approveToZksCore([erc20Token.address], [1])).to.be.revertedWith('Ownable: caller is not the owner')

        await zksTreasury.approveToZksCore([erc20Token.address], [1000])

        // deposit Erc20 to zks core
        await expect(zksTreasury.depositErc20ToZksCore([erc20Token.address], [1000])).to.be.revertedWith('not recharge worker')
        await expect(zksTreasury.connect(rechargeWorker).depositErc20ToZksCore([erc20Token.address], [1001])).to.be.revertedWith('insufficient allowance')
        await zksTreasury.connect(rechargeWorker).depositErc20ToZksCore([erc20Token.address], [1000])

        expect(await mockZksCore.isDepositERC20Invoked()).to.equal(true)
    })

    it("transfer eth to treasury", async () => {
        let ethBalance = await ethers.provider.getBalance(zksTreasury.address)
        const oneEther = ethers.utils.parseEther('1')
        await user.sendTransaction({
            to: zksTreasury.address,
            value: oneEther
        })

        expect(await ethers.provider.getBalance(zksTreasury.address)).to.equal(ethBalance + oneEther)

        // deposit eth to zks core
        await expect(zksTreasury.depositEthToZksCore(oneEther)).to.be.revertedWith('not recharge worker')
        await expect(zksTreasury.connect(rechargeWorker).depositEthToZksCore(oneEther + 1)).to.be.reverted
        await zksTreasury.connect(rechargeWorker).depositEthToZksCore(oneEther)

        // eth balance check
        expect(await ethers.provider.getBalance(zksTreasury.address)).to.equal(0)
        expect(await ethers.provider.getBalance(mockZksCore.address)).to.equal(oneEther)
    })
});
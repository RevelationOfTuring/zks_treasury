const {expect} = require("chai");
const {ethers} = require("hardhat");

describe("MockErc20Token", function () {
    it("common test", async function () {
        const [deployer] = await ethers.getSigners();
        console.log("deployer:" + deployer.address);

        const Erc20Token = await ethers.getContractFactory("MockErc20Token");
        const erc20Token = await Erc20Token.deploy();
        await erc20Token.deployed();
        console.log("erc20 address:" + erc20Token.address);

        const amount = '1024';
        await erc20Token.connect(deployer).mintDirectly(deployer.address, amount);
        expect(await erc20Token.balanceOf(deployer.address)).to.equal(amount);
    });
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

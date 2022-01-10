// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interface/ZksCore.sol";

contract ZksTreasury is Ownable, ReentrancyGuard {
    event DepositETH(address depositer, uint amount);

    ZksCore public zksCoreAddress;
    address public receiverLayer2;

    constructor(address receiverL2, address zksCoreAddr){
        receiverLayer2 = receiverL2;
        zksCoreAddress = ZksCore(zksCoreAddr);
    }

    receive() external payable {
        emit DepositETH(msg.sender, msg.value);
    }

    // deposit eth locked in this contract to layer2
    function depositEthToZKCore(uint amount) external onlyOwner {
        zksCoreAddress.depositETH{value : amount}(receiverLayer2);
    }

    // deposit erc20 locked in this contract to layer2
    function depositErc20ToZKCore(
        address[] calldata tokenAddresses,
        uint104[] calldata amounts
    )
    external
    nonReentrant
    onlyOwner
    {
        require(tokenAddresses.length == amounts.length, "unmatched length");
        for (uint i = 0; i < tokenAddresses.length; ++i) {
            zksCoreAddress.depositERC20(IERC20(tokenAddresses[i]), amounts[i], receiverLayer2);
        }
    }

    // receiverLayer2 setter
    function setReceiverLayer2(address newReceiverLayer2) external onlyOwner {
        receiverLayer2 = newReceiverLayer2;
    }

    // zksCoreAddress setter
    function setZksCoreAddress(address newZksCoreAddress) external onlyOwner {
        zksCoreAddress = ZksCore(newZksCoreAddress);
    }

    // give erc20 approval to Zks core contract
    function approveToZksCore(
        address[] calldata tokenAddresses,
        uint[] calldata allowances
    )
    external
    nonReentrant
    onlyOwner
    {
        require(tokenAddresses.length == allowances.length, "unmatched length");
        for (uint i = 0; i < tokenAddresses.length; ++i) {
            IERC20(tokenAddresses[i]).approve(address(zksCoreAddress), allowances[i]);
        }
    }

    // for emergency
    function emergencyWithdraw(address tokenAddress, uint amount) external onlyOwner nonReentrant {
        if (tokenAddress != address(0)) {
            // withdraw ERC20
            IERC20(tokenAddress).transfer(msg.sender, amount);
            return;
        }

        // withdraw eth
        payable(msg.sender).transfer(amount);
    }
}
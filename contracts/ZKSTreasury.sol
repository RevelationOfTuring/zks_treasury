// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interface/ZKCore.sol";

contract ZKSTreasury is Ownable, ReentrancyGuard {
    event DepositETH(address depositer, uint amount);

    ZKCore public zkCoreAddress;
    address public receiverLayer2;

    constructor(address receiverL2, address zkCoreAddr){
        receiverLayer2 = receiverL2;
        zkCoreAddress = ZKCore(zkCoreAddr);
    }

    receive() external payable {
        emit DepositETH(msg.sender, msg.value);
    }

    // deposit eth locked in this contract to layer2
    function depositEthToZKCore(uint amount) external onlyOwner {
        zkCoreAddress.depositETH{value : amount}(receiverLayer2);
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
            zkCoreAddress.depositERC20(IERC20(tokenAddresses[i]), amounts[i], receiverLayer2);
        }
    }

    // receiverLayer2 setter
    function setReceiverLayer2(address newReceiverLayer2) external onlyOwner {
        receiverLayer2 = newReceiverLayer2;
    }

    // zkCoreAddress setter
    function setZkCoreAddress(address newZkCoreAddress) external onlyOwner {
        zkCoreAddress = ZKCore(newZkCoreAddress);
    }

    // give erc20 approval to ZK core contract
    function approveToZKCore(
        address[] calldata tokenAddresses,
        uint[] calldata allowances
    )
    external
    nonReentrant
    onlyOwner
    {
        require(tokenAddresses.length == allowances.length, "unmatched length");
        for (uint i = 0; i < tokenAddresses.length; ++i) {
            IERC20(tokenAddresses[i]).approve(address(zkCoreAddress), allowances[i]);
        }
    }
}

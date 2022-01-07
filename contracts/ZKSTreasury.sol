// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interface/ZKCore.sol";

contract ZKSTreasury is Ownable, ReentrancyGuard {
    event DepositETH(address depositer, uint amount);

    ZKCore public immutable zkCoreAddress;
    address public receiverLayer2;

    constructor(address receiverL2, address zkCoreAddr){
        receiverLayer2 = receiverL2;
        zkCoreAddress = ZKCore(zkCoreAddr);
    }

    receive() external payable {
        emit DepositETH(msg.sender, msg.value);
    }

    function depositEthToZKCore(uint amount) external onlyOwner {
        zkCoreAddress.depositETH{value : amount}(receiverLayer2);
    }

    function depositErc20ToZKCore(address[] calldata tokenAddresses, uint104[] calldata amounts) external nonReentrant onlyOwner {
        require(tokenAddresses.length == amounts.length, "unmatched length");
        for (uint i = 0; i < tokenAddresses.length; ++i) {
            zkCoreAddress.depositERC20(IERC20(tokenAddresses[i]), amounts[i], receiverLayer2);
        }
    }
}

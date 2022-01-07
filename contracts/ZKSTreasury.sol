// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";

import "./interface/ZKCore.sol";

contract ZKSTreasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    event Deposit(address depositer, address tokenAddress, uint amount);

    address constant _nativeETHAddress = 0x0000000000000000000000000000000000000000;
    ZKCore public immutable zkCoreAddress;
    address public receiverLayer2;

    mapping(address => uint) public maxDepositAmount;

    constructor(uint maxEthDeposit, address receiverL2, address zkCoreAddr){
        maxDepositAmount[_nativeETHAddress] = maxEthDeposit;
        receiverLayer2 = receiverL2;
        zkCoreAddress = ZKCore(zkCoreAddr);
    }

    function setMaxDepositAmount(address[] calldata tokenAddresses, uint128[] calldata newMaxDepositAmounts) external onlyOwner {
        require(tokenAddresses.length == newMaxDepositAmounts.length, "unmatched length");
        for (uint i = 0; i < tokenAddresses.length; ++i) {
            maxDepositAmount[tokenAddresses[i]] = newMaxDepositAmounts[i];
        }
    }

    function depositERC20(address ERC20Address, uint amount) external nonReentrant {
        require(ERC20Address != _nativeETHAddress, "invalid eth");
        require(amount > 0, "invalid ZERO amount");
        require(amount <= maxDepositAmount[ERC20Address], "unsupported ERC20 or overlarge amount");
        address depositor = msg.sender;
        IERC20(ERC20Address).safeTransferFrom(depositor, address(this), amount);
        emit Deposit(depositor, ERC20Address, amount);
    }

    receive() external payable {
        uint ethAmount = msg.value;
        require(ethAmount > 0, "invalid ZERO amount");
        require(ethAmount < maxDepositAmount[_nativeETHAddress], "overlarge amount");
        emit Deposit(msg.sender, _nativeETHAddress, ethAmount);
    }

    function depositToLayer2(address[] calldata tokenAddresses, uint128[] calldata amounts) external nonReentrant onlyOwner {
        require(tokenAddresses.length == amounts.length, "unmatched length");
        for (uint i = 0; i < tokenAddresses.length; ++i) {
            if (tokenAddresses[i] != _nativeETHAddress) {
                zkCoreAddress.depositERC20(IERC20(tokenAddresses[i]), uint104(amounts[i]), receiverLayer2);
            }

            zkCoreAddress.depositETH{value : amounts[i]}(receiverLayer2);
        }
    }
}

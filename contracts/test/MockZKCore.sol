// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interface/ZKCore.sol";

contract MockZKCore is ZKCore {
    bool public isDepositERC20Invoked;
    bool public isDepositETHInvoked;
    address ZKSTreasuryAddress;

    function setZKSTreasuryAddress(address targetAddr) external {
        ZKSTreasuryAddress = targetAddr;
    }

    function depositERC20(IERC20 _token, uint104 _amount, address _franklinAddr) external override {
        isDepositERC20Invoked = true;
        require(IERC20(_token).allowance(ZKSTreasuryAddress, address(this)) >= _amount, "insufficient allowance");
    }

    function depositETH(address _franklinAddr) external override payable {
        isDepositETHInvoked = true;
    }
}
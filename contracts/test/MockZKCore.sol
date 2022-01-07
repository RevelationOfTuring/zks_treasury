// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../interface/ZKCore.sol";

contract MockZKCore is ZKCore {
    bool public isDepositERC20Invoked;
    bool public isDepositETHInvoked;

    function depositERC20(IERC20 _token, uint104 _amount, address _franklinAddr) external override {
        isDepositERC20Invoked = true;
    }

    function depositETH(address _franklinAddr) external override payable {
        isDepositETHInvoked = true;
    }
}
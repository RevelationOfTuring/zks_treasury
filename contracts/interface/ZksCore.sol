// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ZksCore {
    function depositERC20(IERC20 _token, uint104 _amount, address _franklinAddr) external;

    function depositETH(address _franklinAddr) external payable;
}

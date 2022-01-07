// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockErc20Token is ERC20 {
    constructor()ERC20("mock 20", "20"){}

    function mintDirectly(address account, uint256 amount) external {
        _mint(account, amount);
    }
}

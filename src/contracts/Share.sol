// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./OpenZeppelinERC20/ERC20.sol";

contract Share is ERC20 {
    constructor(string memory _tokenName, string memory _tokenSymbol, uint256 _quantity, uint8 _decimals, address to)
        ERC20(_tokenName, _tokenSymbol)
    {
        _mint(to, _quantity * (10**uint256(_decimals)));
    }
}
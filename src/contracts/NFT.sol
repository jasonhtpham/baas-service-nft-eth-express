// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721, ERC721Burnable, Ownable {
    string internal baseURI;

    constructor(
        address initialOwner,
        string memory name,
        string memory unitName,
        string memory _assetURI
    ) ERC721(name, unitName) Ownable(initialOwner) {
        baseURI = _assetURI;
        _safeMint(initialOwner, 1);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}

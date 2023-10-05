// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./Share.sol";
import "./Coin.sol";

contract Company {
    struct Founder {
        address addr;
        uint256 shares;
    }

    Founder[] public founders;

    string public companyName;

    address private sharesAddress;
    Share public shares;
    address private coinsAddress;
    Coin public coins;

    address companyService;

    modifier onlyCompanyService() {
        require(msg.sender == companyService);
        _;
    }

    constructor(string memory _companyName, Founder[] memory _founders) {
        companyName = _companyName;
        for (uint i = 0; i < _founders.length; i++) {
            Founder memory founder = Founder(
                _founders[i].addr,
                _founders[i].shares
            );
            founders.push(founder);
        }
        companyService = msg.sender;
    }

    function setup(
        address _sharesAddress,
        address _coinsAddress
    ) public onlyCompanyService {
        setShares(_sharesAddress);
        setCoins(_coinsAddress);
        distributeSharesSetup();
    }

    function setShares(address _sharesAddress) internal {
        require(sharesAddress == 0x0000000000000000000000000000000000000000);
        sharesAddress = _sharesAddress;
        shares = Share(_sharesAddress);
    }

    function setCoins(address _coinsAddress) internal {
        require(coinsAddress == 0x0000000000000000000000000000000000000000);
        coinsAddress = _coinsAddress;
        coins = Coin(_coinsAddress);
    }

    function distributeSharesSetup() internal {
        for (uint i = 0; i < founders.length; i++) {
            shares.transfer(
                founders[i].addr,
                founders[i].shares * (10 ** shares.decimals())
            );
        }
    }

    function _founderExists(
        Founder memory founderToAdd
    ) internal view returns (int) {
        int atIndex = -1;
        for (uint i = 0; i < founders.length; i++) {
            if (founderToAdd.addr == founders[i].addr) {
                atIndex = int(i);
            }
        }
        return atIndex;
    }

    function distributeRemainShares(
        Founder memory founderToAdd
    ) public onlyCompanyService {
        int i = _founderExists(founderToAdd);
        if (i > -1) {
            shares.transfer(
                founders[uint(i)].addr,
                founders[uint(i)].shares * (10 ** shares.decimals())
            );
            return;
        }
        Founder memory founder = Founder(
            founderToAdd.addr,
            founderToAdd.shares
        );
        founders.push(founder);
        shares.transfer(
            founderToAdd.addr,
            founderToAdd.shares * (10 ** shares.decimals())
        );
    }

    function getTotalShares() public view returns (uint256) {
        return shares.totalSupply();
    }

    function getTotalCoins() public view returns (uint256) {
        return coins.totalSupply();
    }

    function getNumberOfFounders() public view returns (uint256) {
        return founders.length;
    }
}

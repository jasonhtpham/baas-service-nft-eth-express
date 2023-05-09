// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "./Share.sol";
import "./Coin.sol";

contract Company {

    address[] founders;
    string public companyName;

    address public sharesAddress;
    Share public shares;
    address public coinsAddress;
    Coin public coins;

    address companyService;

    modifier onlyCompanyService {
        require(msg.sender == companyService);
        _;
    }

    constructor(string memory _companyName, address[] memory _founders)
    {
        companyName = _companyName;
        founders = _founders;
        companyService = msg.sender;
    }

    function setup(address _sharesAddress, address _coinsAddress) public onlyCompanyService {
        setShares(_sharesAddress);
        setCoins(_coinsAddress);
        distributeTokensSetup();
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

    function distributeTokensSetup() internal {
        uint256 sharesAmount = shares.balanceOf(address(this)) / founders.length;
        for (uint i = 0; i < founders.length; i++) {
            shares.transfer(founders[i], sharesAmount);
        }
    }

    function getTotalShares() public view returns(uint256) {
        return shares.totalSupply();
    }

    function getTotalCoins() public view returns(uint256) {
        return coins.totalSupply();
    }

}
// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Coin is ERC20, Ownable {
    constructor(
        address initialOwner,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _quantity,
        uint8 _decimals
    ) ERC20(_tokenName, _tokenSymbol) Ownable(initialOwner) {
        _mint(address(this), _quantity * (10 ** uint256(_decimals)));
    }
}

contract Share is ERC20, Ownable {
    constructor(
        address initialOwner,
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _quantity,
        uint8 _decimals,
        address to
    ) ERC20(_tokenName, _tokenSymbol) Ownable(initialOwner) {
        _mint(to, _quantity * (10 ** uint256(_decimals)));
    }
}

contract Company {
    struct Founder {
        address addr;
        uint256 sharesAmount;
    }

    Founder[] public founders;
    string public companyName;

    Share public shares;
    Coin public coins;

    address immutable companyService;

    event ShareCoinIssued(address, address);

    modifier onlyCompanyService() {
        require(msg.sender == companyService);
        _;
    }

    constructor(string memory _companyName, Founder[] memory _founders) {
        companyName = _companyName;
        for (uint i = 0; i < _founders.length; i++) {
            Founder memory founder = Founder(
                _founders[i].addr,
                _founders[i].sharesAmount
            );
            founders.push(founder);
        }
        companyService = msg.sender;
    }

    function setup(
        string memory _shareName,
        string memory _shareSymbol,
        uint256 _shareQuantity,
        uint8 _shareDecimals,
        string memory _coinName,
        string memory _coinSymbol,
        uint256 _coinQuantity,
        uint8 _coinDecimals
    ) public onlyCompanyService {
        shares = new Share(
            address(this),
            _shareName,
            _shareSymbol,
            _shareQuantity,
            _shareDecimals,
            address(this)
        );
        coins = new Coin(
            address(this),
            _coinName,
            _coinSymbol,
            _coinQuantity,
            _coinDecimals
        );
        distributeSharesSetup();
        emit ShareCoinIssued(address(shares), address(coins));
    }

    function distributeSharesSetup() internal {
        for (uint i = 0; i < founders.length; i++) {
            shares.transfer(
                founders[i].addr,
                founders[i].sharesAmount * (10 ** shares.decimals())
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
                founders[uint(i)].sharesAmount * (10 ** shares.decimals())
            );
            return;
        }
        Founder memory founder = Founder(
            founderToAdd.addr,
            founderToAdd.sharesAmount
        );
        founders.push(founder);
        shares.transfer(
            founderToAdd.addr,
            founderToAdd.sharesAmount * (10 ** shares.decimals())
        );
    }

    function getTotalShares() public view returns (uint256) {
        return shares.totalSupply();
    }

    function getTotalCoins() public view returns (uint256) {
        return coins.totalSupply();
    }

    function getFounders() public view returns (Founder[] memory) {
        Founder[] memory founderArray = new Founder[](founders.length);

        for (uint i = 0; i < founders.length; i++) {
            founderArray[i] = founders[i];
        }

        return founderArray;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PortToken is ERC20, Ownable {
    string public portName;
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        string memory _portName,
        uint8 __decimals,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        portName = _portName;
        _decimals = __decimals;
        _mint(msg.sender, initialSupply * 10 ** __decimals);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}

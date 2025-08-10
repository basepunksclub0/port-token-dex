// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PortOracle is Ownable {
    // Port performance data structure
    struct PortData {
        uint256 price;
        uint256 lastUpdated;
    }
    
    // Mapping of port names to their data
    mapping(string => PortData) public portData;
    
    // Mapping of token addresses to port names
    mapping(address => string) public tokenToPort;
    
    constructor() Ownable(msg.sender) {}
    
    // Set port data (mock oracle functionality)
    function setPortData(string memory _portName, uint256 _price) public onlyOwner {
        portData[_portName] = PortData({
            price: _price,
            lastUpdated: block.timestamp
        });
    }
    
    // Link a token address to a port name
    function linkTokenToPort(address _tokenAddress, string memory _portName) public onlyOwner {
        tokenToPort[_tokenAddress] = _portName;
    }
    
    // Get price for a port
    function getPrice(string memory _portName) public view returns (uint256) {
        return portData[_portName].price;
    }
    
    // Get price for a token address
    function getPriceByToken(address _tokenAddress) public view returns (uint256) {
        string memory portName = tokenToPort[_tokenAddress];
        return portData[portName].price;
    }
    
    // Get last updated timestamp for a port
    function getLastUpdated(string memory _portName) public view returns (uint256) {
        return portData[_portName].lastUpdated;
    }
}

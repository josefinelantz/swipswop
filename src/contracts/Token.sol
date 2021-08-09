// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Token {
    using SafeMath for uint256;

    // Token name
    string public name = "Camel Token";
    // Token symbol to display in exchange
    string public symbol = "CAMEL";
    uint8 public decimals = 18;
    // 1 million tokens supplied
    uint256 public totalSupply;
    
     /*
    Events (indexed enables filtering of events to subscribe to)
    */ 
    event Approval(address indexed owner, address indexed spender, uint tokens);
    event Transfer(address indexed from, address indexed to, uint tokens);

    /*
    Deployer can delegate tokens to many different places
      1. Address tokenOwner
      2. Address spender
      3. Amount allowed to spend on behalf of deployer
    */

    mapping(address => uint256) public balanceOf;

    mapping(address => mapping(address => uint256)) public allowance;

    constructor() {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    /*
      address receiver - recipient address Transfer 
      uint256 numTokens - _value amount of tokens to address _to could be 0
      success - true if operation succeeds    
      Transfer - event emitted
    */ 
    function transfer(address receiver, uint256 numTokens) public returns (bool success) {
        require(numTokens <= balanceOf[msg.sender], "Insufficient balance.");
        
        // Recipient address cannot be the zero address
        require(receiver != address(0));
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(numTokens);
        balanceOf[receiver] = balanceOf[receiver].add(numTokens);
        emit Transfer(msg.sender, receiver, numTokens);
        return true; 
    }

    /* 
      Allows a spender to withdraw from tokenOwners' account multiple times, up to the allowed amount. 
      If this function is called again it overwrites the current allowance with the new value.
    */

    function approve(address delegate, uint256 numTokens) public returns (bool success) {
        allowance[msg.sender][delegate] = 0;
        allowance[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true; 
    }

    /* 
      Allows a contract to transfer tokens on tokenOwners' behalf and/or to charge fees in sub-currencies.
      Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event.
    */

    function transferFrom(
        address owner,
        address buyer,
        uint256 numTokens
    ) public returns (bool success) {
        require(numTokens <= balanceOf[owner]);
        require(numTokens <= allowance[owner][msg.sender]);

        balanceOf[owner] = balanceOf[owner].sub(numTokens);
        balanceOf[buyer] = balanceOf[buyer].add(numTokens);

        allowance[owner][msg.sender] = allowance[owner][msg.sender].sub(numTokens);
        emit Transfer(owner, buyer, numTokens);
        return true; 
    }  
}
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Token {
    using SafeMath for uint256;
    // State variables belong to the smart contract and represents the status. Like a db table
    string public name = "DApp Token";
    string public symbol = "DAPP";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // Store information on account balances on the blockchain
    // We want this to be immutable
    mapping(address => uint256) public balanceOf;

    // How many tokens the exchange has permission to spend
    // deployer address, exhange address, amount allowed to spend
    // Deployer could have many different places where tokens are delegated
    mapping(address => mapping(address => uint256)) public allowance;

    //mapping(address => uint256) private _balances;

    // Events (indexed enables filtering of events to subscribe to)
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor() {
        // name = _name;
        // symbol = _symbol;
        // decimals = 18;
        totalSupply = 1000000 * (10**18);
        balanceOf[msg.sender] = totalSupply;
    }

    // Transfer _value amount of tokens to address _to
    // MUST fire the Transfer event.
    // SHOULD throw if the message caller’s account balance does not have enough tokens to spend.
    // Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event.
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value);
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal {
        require(_to != address(0));
        balanceOf[_from] = balanceOf[_from].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(_from, _to, _value);
    }

    // The transferFrom method is used for a withdraw workflow, allowing contracts to transfer tokens on your behalf. This can be used for example to allow a contract to transfer tokens on your behalf and/or to charge fees in sub-currencies.
    // SHOULD throw unless the _from account has deliberately authorized the sender of the message via some mechanism handled by the Approve function.
    // Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event.

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        _transfer(_from, _to, _value);
        return true;
    }

    // The Approve function Allows a _spender to withdraw from _spenders' account multiple times, up to the _value amount. If this function is called again it overwrites the current allowance with _value.

    // NOTE: To prevent attack vectors like the one described here and discussed here, clients SHOULD make sure to create user interfaces in such a way that they set the allowance first to 0 before setting it to another value for the same spender. THOUGH The contract itself shouldn’t enforce it, to allow backwards compatibility with contracts deployed before

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    //function allowance(address _owner, address _spender) public view returns (uint256 remaining)
}

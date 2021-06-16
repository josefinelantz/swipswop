// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Token {
    // State variables
    string public name = "DApp Token";
    string public symbol = "DAPP";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // mapping(address => uint256) private _balances;

    constructor() public {
        // name = _name;
        // symbol = _symbol;
        // decimals = 18;
        totalSupply = 1000000 * (10**18);
    }

    // Transfers _value amount of tokens to address _to, and MUST fire the Transfer event. The function SHOULD throw if the message caller’s account balance does not have enough tokens to spend.

    // Note Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event.

    //function transfer(address _to, uint256 _value) public returns (bool success)

    // Transfers _value amount of tokens from address _from to address _to, and MUST fire the Transfer event.

    // The transferFrom method is used for a withdraw workflow, allowing contracts to transfer tokens on your behalf. This can be used for example to allow a contract to transfer tokens on your behalf and/or to charge fees in sub-currencies. The function SHOULD throw unless the _from account has deliberately authorized the sender of the message via some mechanism.

    // Note Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event.

    //function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)

    // The Approve function Allows a _spender to withdraw from _spenders' account multiple times, up to the _value amount. If this function is called again it overwrites the current allowance with _value.

    // NOTE: To prevent attack vectors like the one described here and discussed here, clients SHOULD make sure to create user interfaces in such a way that they set the allowance first to 0 before setting it to another value for the same spender. THOUGH The contract itself shouldn’t enforce it, to allow backwards compatibility with contracts deployed before

    // 	function approve(address _spender, uint256 _value) public returns (bool success)
    //  	allowance
    // 		Returns the amount which _spender is still allowed to withdraw from _owner.

    // function allowance(address _owner, address _spender) public view returns (uint256 remaining)
}

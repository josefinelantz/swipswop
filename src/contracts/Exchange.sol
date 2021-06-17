// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Exchange {
    address public feeAccount; // The account where fees go
    uint256 public feePercent; // Fee percentage

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Token.sol";

contract Exchange {
    using SafeMath for uint256;

    address public feeAccount; // The account where fees go
    uint256 public feePercent; // Fee percentage
    address constant ETHER = address(0); // Allows for storing Ether in tokens mapping.
    // Token address, user who deposited address, user balance
    mapping(address => mapping(address => uint256)) public tokens;

    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    receive() external payable {
        revert();
    }

    function depositEther() public payable {
      tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
      emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    // address to the actual token, in our case the address of token deploed in Token.sol.
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        // Send tokens to this contract, it could be any ERC20 token
        // Instance of this token on the Ethereum network
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
			require(_token != ETHER);
			require(Token(_token).transfer(msg.sender, _amount));
      tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
      emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

		function balanceOf(address _token, address _user) public view returns (uint256) {
			return tokens[_token][_user];
		}
}

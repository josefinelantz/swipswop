// Reading the compiled contract abi and creates a JS Object representation of the contract. 
const Token = artifacts.require("Token");

module.exports = function (deployer) {
  deployer.deploy(Token);
};

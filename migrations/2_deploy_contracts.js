// Reading the compiled contract abi and creates a JS Object representation of the contract. 
const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts();
  await deployer.deploy(Token);
  feeAccount = accounts[0];
  const feePercent = 10;
  
  await deployer.deploy(Exchange, feeAccount, feePercent);
};

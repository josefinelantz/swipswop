import React from "react";
import "./App.css";
import Token from "../abis/Token.json";
import web3 from "../web3";
import {Header} from "./Header";

class App extends React.Component {

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();

    // loadTokenContract = async () => {
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[networkId];

    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      // const exchange = new web3.eth.Contract(Exchange.abi, tokenData.address);
    }

  }    
  render() {
    web3.eth.getAccounts().
    then(console.log);

    return (
      <div>
        <div>
          <Header />
        </div>
 
        <div className="content">
          <div className="item balance">Balance</div>
          <div className="item orderbook">Orderbook</div>
          <div className="item price-chart">Price Chart</div>
	        <div className="item trades">Trades</div>
          <div className="item new-order">New Order</div>
          <div className="item my-transactions">My Transactions</div>
        </div>     
      </div>  
      );
    }
  }
  // setUserAccount = async () => {
  //   if (window.ethereum) {
  //     await window.ethereum.enable();
  //     web3.eth.getAccounts().then(accounts => {
  //       setAccount(accounts[0]);
  //       setEthBalance(accounts[0]);
  //     });
  //   }
  // }

  // setUserEthBalance = async (fromAddress) => {
  //   await web3.eth.getBalance(fromAddress).then(value => {
  //     const credit = web3.utils.fromWei(value, "ether");
  //     setEthBalance(credit.toString());
  //   });
  // }

  // setUserTokenBalance = async (fromAddress) => {
  //   const userTokenBalance = await token.methods.balanceOf(account).call(); 
  //   if (userTokenBalance) {
  //     setTokenBalance(userTokenBalance.toString());
  //   } else {
  //     window.alert("Token contract not deployed to detected network.");
  //   }
  // }

  // sendTransaction = async (event) => {
  //   event.preventDefault();
  //   const amount = event.target[0].value;
  //   const recipient = event.target[1].value;
  //   await web3.eth.sendTransaction({
  //     from: account,
  //     to: recipient,
  //     value: web3.utils.toWei(amount, "ether")
  //   });
  //   setUserEthBalance(account);
  // };



    

export default App;

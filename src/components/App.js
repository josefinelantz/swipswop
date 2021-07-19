import React from "react";
import "./App.css";
import Token from "../abis/Token.json";
import { useWeb3 } from "../getweb3";
import { useStoreApi } from "../storeApi";
import {Navigation} from "./Navigation";
import {Content} from "./Content";

function App() {
  const { 
    account, 
    token, 
    ethBalance, 
    tokenBalance, 
    setAccount, 
    setToken, 
    setEthBalance, 
    setTokenBalance 
  } = useStoreApi();
  
  const web3 = useWeb3();

  const setUserAccount = async () => {
    if (window.ethereum) {
      await window.ethereum.enable();
      web3.eth.getAccounts().then(accounts => {
        setAccount(accounts[0]);
        setEthBalance(accounts[0]);
      });
    }
  }

  const setUserEthBalance = async (fromAddress) => {
    await web3.eth.getBalance(fromAddress).then(value => {
      const credit = web3.utils.fromWei(value, "ether");
      setEthBalance(credit.toString());
    });
  }

  const setUserTokenBalance = async (fromAddress) => {
    const userTokenBalance = await token.methods.balanceOf(account).call(); 
    if (userTokenBalance) {
      setTokenBalance(userTokenBalance.toString());
    } else {
      window.alert("Token contract not deployed to detected network.");
    }
  }

  const sendTransaction = async (event) => {
    event.preventDefault();
    const amount = event.target[0].value;
    const recipient = event.target[1].value;
    await web3.eth.sendTransaction({
      from: account,
      to: recipient,
      value: web3.utils.toWei(amount, "ether")
    });
    setUserEthBalance(account);
  };

  const loadTokenContract = async () => {
    const networkId = await web3.eth.net.getId();
    const tokenData = Token.networks[networkId];

    if (tokenData) {
      setToken = new web3.eth.Contract(Token.abi, tokenData.address);
    }
  }

    return (
      <div>
        <Navigation />
        <Content />
      </div>
    );
}
export default App;

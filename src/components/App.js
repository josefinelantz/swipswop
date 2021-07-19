import React from "react";
import "./App.css";
import Token from "../abis/Token.json";
import { useWeb3 } from "../getweb3";
import { useStoreApi } from "../storeApi";
import { Button, TextField } from "@material-ui/core";

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
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <a className="navbar-brand" href="/#">Navbar</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse"  data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item"><a className="nav-link" href="/#">Link 1</a></li>
              <li className="nav-item"><a className="nav-link" href="/#">Link 2</a></li>
              <li className="nav-item"><a className="nav-link" href="/#">Link 3</a></li>
            </ul>
          </div>
        </nav>
        
        <div className="content">
          
          <div className="vertical-split">
            
            <div className="card bg-dark text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and   make up the bulk of the card's content.
                </p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
            <div className="card bg-dark text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.
                </p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>
          <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>
          <div className="vertical-split">
            <div className="card bg-dark text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
            <div className="card bg-dark text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>
          <div className="vertical">
            <div className="card bg-dark text-white">
              <div className="card-header">
                Card Title
              </div>
              <div className="card-body">
                <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="/#" className="card-link">Card link</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  
}
export default App;

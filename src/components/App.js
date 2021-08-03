import React from "react";
import "./App.css";
import Navbar from "./Navbar";
import Content from "./Content";
import { connect } from "react-redux";
import {
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange
} from "../store/interactions";
import { contractsLoadedSelector } from "../store/selectors";

class App extends React.Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch);
    const network = await web3.eth.net.getNetworkType();
    const networkId = await web3.eth.net.getId();
    const account = await loadAccount(web3, dispatch);
    
    const token = await loadToken(web3, networkId, dispatch);
    if (!token) {
      window.alert("Token smart contract not detected on the current network Please select another network with Metamask.");
    }
    
    const exchange = await loadExchange(web3, networkId, dispatch);
    if (!exchange) {
      window.alert("Exchange smart contract not detected on the current network Please select another network with Metamask.");
    }
  }
  
  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ?  <Content /> 
        : <div className="content"></div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    // This will be accessible as props in render function. 
    contractsLoaded: contractsLoadedSelector(state)
  }
}
export default connect(mapStateToProps)(App);
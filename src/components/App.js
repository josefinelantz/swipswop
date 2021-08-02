import Web3 from "web3";
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
import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  exchangeLoaded
} from "../store/actions";
import { contractsLoadedSelector } from "../store/selectors";

class App extends React.Component {

  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch);
    //const network = await web3.eth.net.getNetworkType();
    const networkId = await web3.eth.net.getId();
    const account = await loadAccount(web3, dispatch);
    const token = loadToken(web3, networkId, dispatch);
    const exchange = loadExchange(web3, networkId, dispatch);
  }
    
  render() {
    return (
      <div>
        <Navbar />
        { this.props.contractsLoaded ? <Content /> : <div className="content"></div> }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state)  
  }
}
export default connect(mapStateToProps)(App);
import Web3 from "web3";
import React from "react";
import "./App.css";
import Navbar from "./Navbar";
import Content from "./Content";
import { connect } from "react-redux";
import {
  loadWeb3,
  loadAccount,
  loadToken
} from "../store/interactions";
import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  loadExchange
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
    const token = await loadToken(web3, networkId, dispatch);
    const exchange = await loadExchange();
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
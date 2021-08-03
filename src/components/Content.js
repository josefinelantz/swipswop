import React from "react";
import { connect } from "react-redux";
import { exchangeSelector } from "../store/selectors";
import { loadAllOrders } from "../store/interactions";
import Trades from "./Trades";
//import OrderBook from "./OrderBook";
// import MyTransactions from "./MyTransactions";
// import PriceChart from "./PriceChart";
// import Balance from "./Balance";
// import NewOrder from "./NewOrder";

class Content extends React.Component {
  componentDidMount() {
    this.loadBlockchainData(this.props)
  }

  async loadBlockchainData(props) {
    const { dispatch, exchange } = props;
    await loadAllOrders(exchange, dispatch);
    //await subscribeToEvents(exchange, dispatch);
  }

  render() {
    return (
      <div className="content">
        <div className="vertical-split">
        </div>
        <div className="vertical-split">
        </div>
        <Trades />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    exchange: exchangeSelector(state)
  }
}

export default connect(mapStateToProps)(Content);

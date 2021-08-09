import Web3 from "web3";
import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  exchangeLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded, 
  orderCancelling,
  orderCancelled,
  orderFilling
  }
from "./actions";

import Token from "../abis/Token.json";
import Exchange from "../abis/Exchange.json";

export const loadWeb3 = async (dispatch) => {
  let web3;
  if(typeof window.ethereum!=="undefined" && typeof window.ethereum !== "undefined") {
    // In the browser and Metamask is running.
    window.ethereum.request({ method: "eth_requestAccounts" });
    web3 = new Web3(window.ethereum);
    dispatch(web3Loaded(web3));
    return web3;
  } else {
    // We are on the server OR the user is not running Metamask. 
    const provider = new Web3.providers.HttpProvider("http://localhost:7545");
    web3 = new Web3(provider);
    return web3;
    window.alert("Please install MetaMask");
    window.location.assign("https://metamask.io/");
  }
}

export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.requestAccounts();
  const account = accounts[0];
  dispatch(web3AccountLoaded(account));
  return account;
}

export const loadToken = async (web3, networkId, dispatch) => {
  try {
    const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address);
    dispatch(tokenLoaded(token));
    return token;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const loadExchange = async (web3, networkId, dispatch) => {
  try {
    const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address);
    dispatch(exchangeLoaded(exchange));
    return exchange;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const loadAllOrders = async (exchange, dispatch) => {
  // Fetch cancelled orders with the "Cancel" event stream
  const cancelStream = await exchange.getPastEvents("Cancel", {fromBlock: 0, toBlock: "latest"});
  
  // Format cancelled orders
  const cancelledOrders = cancelStream.map((event) => event.returnValues);
  
  // Add cancelled orders to the redux store
  dispatch(cancelledOrdersLoaded(cancelledOrders));

  // Fetch filled orders with the "Trade" event stream
  const tradeStream = await exchange.getPastEvents("Trade", { fromBlock: 0, toBlock: "latest" });
  
  // Format filled orders
  const filledOrders = tradeStream.map((event) => event.returnValues);
  // Add cancelled orders to the redux store
  dispatch(filledOrdersLoaded(filledOrders));

  // Fetch order stream
  const orderStream = await exchange.getPastEvents("Order", {fromBlock: 0, toBlock: "latest"});
  
  // Format order stream
  const allOrders = orderStream.map((event) => event.returnValues);
  // Add open orders to the redux store
  dispatch(allOrdersLoaded(allOrders));
}

export const subscribeToEvents = async (exchange, dispatch) => {
  exchange.events.Cancel({}, (error, event) => {
    dispatch(orderCancelled(event.returnValues))
  })
}

export const cancelOrder = (dispatch, exchange, order, account) => {
  exchange.methods.cancelOrder(order.id).send({ from: account })
  .on("transactionHash", (hash) => {
    dispatch(orderCancelling())
  })
  .on("error", (error) => {
    console.log(error)
    window.alert("There was an error")
  })
}

export const fillOrder = (dispatch, exchange, order, account) => {
  exchange.methods.fillOrder(order.id).send({ from: account })
  .on("transactionHash", (hash) => {
     dispatch(orderFilling())
  })
  .on("error", (error) => {
    console.log(error);
    window.alert("There was an error!")
  })
}

/*
Create transaction
{
  from: "0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8",
  to: "0xac03bb73b6a9e108530aff4df5077c2b3d481e5a",
  gasLimit: "21000",
  maxFeePerGas: "300"
  maxPriorityFeePerGas: "10"
  nonce: "0",
  value: "10000000000",
}*/

/**
RPC Call
{
  "id": 2,
  "jsonrpc": "2.0",
  "method": "account_signTransaction",
  "params": [
    {
      "from": "0x1923f626bb8dc025849e00f99c25fe2b2f7fb0db",
      "gas": "0x55555",
      "maxFeePerGas": "0x1234",
      "maxPriorityFeePerGas": "0x1234",
      "input": "0xabcd",
      "nonce": "0x0",
      "to": "0x07a565b7ed7d7a678680a4c162885bedbb695fe0",
      "value": "0x1234"
    }
  ]
}

RPC response
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "raw": "0xf88380018203339407a565b7ed7d7a678680a4c162885bedbb695fe080a44401a6e4000000000000000000000000000000000000000000000000000000000000001226a0223a7c9bcf5531c99be5ea7082183816eb20cfe0bbc322e97cc5c7f71ab8b20ea02aadee6b34b45bb15bc42d9c09de4a6754e7000908da72d48cc7704971491663",
    "tx": {
      "nonce": "0x0",
      "maxFeePerGas": "0x1234",
      "maxPriorityFeePerGas": "0x1234",
      "gas": "0x55555",
      "to": "0x07a565b7ed7d7a678680a4c162885bedbb695fe0",
      "value": "0x1234",
      "input": "0xabcd",
      "v": "0x26",
      "r": "0x223a7c9bcf5531c99be5ea7082183816eb20cfe0bbc322e97cc5c7f71ab8b20e",
      "s": "0x2aadee6b34b45bb15bc42d9c09de4a6754e7000908da72d48cc7704971491663",
      "hash": "0xeba2df809e7a612a0a0d444ccfa5c839624bdc00dd29e3340d46df3870f8a30e"
    }
  }
}

ETH values are in Wei by default. 1 ETH = 1,000,000,000,000,000,000 WEI – this means you're dealing with a lot of numbers! web3.utils.toWei converts ether to Wei for you.

Gas fees are paid in Ethereum's native currency, ether (ETH). Gas prices are denoted in gwei, which itself is a denomination of ETH - each gwei is equal to 0.000000001 ETH (10-9 ETH). For example, instead of saying that your gas costs 0.000000001 ether, you can say your gas costs 1 gwei.


 */


// export const loadBalances = async (dispatch, web3, exchange, token, account) => {
//   if(typeof account !== "undefined") {
//       // Ether balance in wallet
//       const etherBalance = await web3.eth.getBalance(account)
//       dispatch(etherBalanceLoaded(etherBalance))

//       // Token balance in wallet
//       const tokenBalance = await token.methods.balanceOf(account).call()
//       dispatch(tokenBalanceLoaded(tokenBalance))

//       // Ether balance in exchange
//       const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
//       dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))

//       // Token balance in exchange
//       const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
//       dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))

//       // Trigger all balances loaded
//       dispatch(balancesLoaded())
//     } else {
//       window.alert("Please login with MetaMask")
//     }
// }

// export const depositEther = (dispatch, exchange, web3, amount, account) => {
//   exchange.methods.depositEther().send({ from: account,  value: web3.utils.toWei(amount, "ether") })
//   .on("transactionHash", (hash) => {
//     dispatch(balancesLoading())
//   })
//   .on("error",(error) => {
//     console.error(error)
//     window.alert(`There was an error!`)
//   })
// }

// export const withdrawEther = (dispatch, exchange, web3, amount, account) => {
//   exchange.methods.withdrawEther(web3.utils.toWei(amount, "ether")).send({ from: account })
//   .on("transactionHash", (hash) => {
//     dispatch(balancesLoading())
//   })
//   .on("error",(error) => {
//     console.error(error)
//     window.alert(`There was an error!`)
//   })
// }

// export const depositToken = (dispatch, exchange, web3, token, amount, account) => {
//   amount = web3.utils.toWei(amount, "ether")

//   token.methods.approve(exchange.options.address, amount).send({ from: account })
//   .on("transactionHash", (hash) => {
//     exchange.methods.depositToken(token.options.address, amount).send({ from: account })
//     .on("transactionHash", (hash) => {
//       dispatch(balancesLoading())
//     })
//     .on("error",(error) => {
//       console.error(error)
//       window.alert(`There was an error!`)
//     })
//   })
// }

// export const withdrawToken = (dispatch, exchange, web3, token, amount, account) => {
//   exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, "ether")).send({ from: account })
//   .on("transactionHash", (hash) => {
//     dispatch(balancesLoading())
//   })
//   .on("error",(error) => {
//     console.error(error)
//     window.alert(`There was an error!`)
//   })
// }

// export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
//   const tokenGet = token.options.address
//   const amountGet = web3.utils.toWei(order.amount, "ether")
//   const tokenGive = ETHER_ADDRESS
//   const amountGive = web3.utils.toWei((order.amount * order.price).toString(), "ether")

//   exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
//   .on("transactionHash", (hash) => {
//     dispatch(buyOrderMaking())
//   })
//   .on("error",(error) => {
//     console.error(error)
//     window.alert(`There was an error!`)
//   })
// }

// export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
//   const tokenGet = ETHER_ADDRESS
//   const amountGet = web3.utils.toWei((order.amount * order.price).toString(), "ether")
//   const tokenGive = token.options.address
//   const amountGive = web3.utils.toWei(order.amount, "ether")

//   exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
//   .on("transactionHash", (hash) => {
//     dispatch(sellOrderMaking())
//   })
//   .on("error",(error) => {
//     console.error(error)
//     window.alert(`There was an error!`)
//   })
// }
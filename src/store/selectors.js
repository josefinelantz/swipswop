import { get, groupBy, reject, maxBy, minBy } from "lodash";
import { createSelector } from "reselect";
import moment from "moment";
import { ETHER_ADDRESS, ether, tokens, GREEN, RED } from "../helpers";

/**********Order Book**********/

const allOrders = state => get(state, "exchange.allOrders.data", []);
const cancelledOrders = state => get(state, "exchange.cancelledOrders.data", []);
const filledOrders = state => get(state, "exchange.filledOrders.data", []);

export const filledOrdersSelector = createSelector(
  filledOrders,
  (orders) => {
    // Sort orders by date ascending for price comparison
    orders = orders.sort((a, b) => a.timestamp - b.timestamp)
    // Decorate the orders
    orders = decorateFilledOrders(orders);
    // Sort orders by date descending for display
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);
    return orders;
})

const allOrdersLoaded = state => get(state, "exchange.allOrders.loaded", false);
const cancelledOrdersLoaded = state => get(state, "exchange.cancelledOrders.loaded", false);
const filledOrdersLoaded = state => get(
  state, "exchange.filledOrders.loaded", false);


export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded);
export const filledOrdersLoadedSelector = createSelector(
  filledOrdersLoaded, loaded => loaded);

// Filled Orders


const account = state => get(state, "web3.account"); 
export const accountSelector = createSelector(account, (account) => {
  return account;
});

const tokenLoaded = state => get(state, "token.loaded", false);
export const tokenLoadedSelector = createSelector(tokenLoaded, (tokenLoaded) => {
  return tokenLoaded;
});

const exchangeLoaded = state => get(state, "exchange.loaded", false);
export const exchangeLoadedSelector = createSelector(exchangeLoaded, (exchangeLoaded) => {
  return exchangeLoaded; 
});

const exchange = state => get(state, "exchange.contract");
export const exchangeSelector = createSelector(exchange, 
  (exchange) => {
    return exchange
});

export const contractsLoadedSelector = createSelector(
  tokenLoaded, 
  exchangeLoaded,
  (tokenLoaded, exchangeLoaded) => (tokenLoaded && exchangeLoaded)
);
// Map over filled orders and send them to decorate function
const decorateFilledOrders = (orders) => {
  // Track previous order to compare history
  let previousOrder = orders[0];
  return (
    orders.map((order) => {
      order = decorateOrder(order);
      order = decorateFilledOrder(order, previousOrder);
      previousOrder = order; // Update the previous order once it's decorated
      return order; 
    })
  )
}

// Decorate orders with formatted data. 
const decorateOrder = (order) => {
  let etherAmount;
  let tokenAmount;
  if (order.tokenGive === ETHER_ADDRESS) {
    etherAmount = order.amountGive;
    tokenAmount = order.amountGet;
  } else {
    etherAmount = order.amountGet;
    tokenAmount = order.amountGive;
  }

  // Calculate token price to 5 decimal places. 
  const precision = 100000;
  let tokenPrice = (etherAmount / tokenAmount);
  tokenPrice = Math.round(tokenPrice * precision) / precision; 

  return({
    ...order,
    etherAmount: ether(etherAmount),
    tokenAmount: tokens(tokenAmount),
    tokenPrice, 
    formattedTimestamp: moment.unix(order.timestamp).format("HH:MM:SS DD/MM")
    })
  }

const decorateFilledOrder = (order, previousOrder) => {
  return({ 
    ...order, 
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
  })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  if (previousOrder === orderId) {
    return GREEN;
  }
  // Show green price if order price higher than previous order
  // Show red price if order price lower than previous order
  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN; // success bootstrap class
  } else {
    return RED; // danger bootstrap class
  }
}

const openOrders = state => {
  const all = allOrders(state); 
  const filled = filledOrders(state);
  const cancelled = cancelledOrders(state);
  
  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o.id === order.id);
    const orderCancelled = cancelled.some((o) => o.id === order.id);
    return (orderFilled || orderCancelled)
  })
  return openOrders; 
}

const orderBookLoaded = state => 
cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state);

export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => loaded);


// Create the order book
export const orderBookSelector = createSelector(
  openOrders,
  (orders) => {
    // Decorate orders
    orders = decorateOrderBookOrders(orders);
    // Group orders by "orderType"
    orders = groupBy(orders, "orderType");
    // Fetch buy orders
    const buyOrders = get(orders, "buy", []);
    // Sort buy orders by token price
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a, b) => a.tokenPrice - b.tokenPrice)
    }
    // Fetch sell orders
    const sellOrders = get(orders, "sell", []);
    // Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }
    return orders;
  }
)

const decorateOrderBookOrders = (orders) => {
  return (
    orders.map((order) => {
      order = decorateOrder(order);
      order = decorateOrderBookOrder(order);
      return(order); 
    })
  )
}

const decorateOrderBookOrder = (order) => {
  const orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";
  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === "buy" ? GREEN : RED),
    orderFillAction: orderType === "buy" ? "sell" : "buy"
  });
}

const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)


const token = state => get(state, 'token.contract')
export const tokenSelector = createSelector(token, t => t)

/**********My Transactions**********/


export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded);

export const myFilledOrdersSelector = createSelector(
  account,
  filledOrders,
  (account, orders) => {
    // Find our orders
    orders = orders.filter((o) => o.user === account || o.userFill === account);
    // Sort by date ascending
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);
    // Decorate orders - add display attributes
    orders = decorateMyFilledOrders(orders, account)
    return orders;
  }
);

const decorateMyFilledOrders = (orders, account) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order);
      order = decorateMyFilledOrder(order, account);
      return(order);
    })
  )
}

const decorateMyFilledOrder = (order, account) => {
  const myOrder = order.user === account;

  let orderType
  if(myOrder) {
    orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";
  } else {
    orderType = order.tokenGive === ETHER_ADDRESS ? "sell" : "buy";
  }

  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === "buy" ? GREEN : RED),
    orderSign: (orderType === "buy" ? "+" : "-")
  })
}

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded);

export const myOpenOrdersSelector = createSelector(
  account,
  openOrders,
  (account, orders) => {
    // Filter orders created by current account
    orders = orders.filter((o) => o.user === account);
    // Decorate orders - add display attributes
    orders = decorateMyOpenOrders(orders);
    // Sort orders by date descending
    orders = orders.sort((a,b) => b.timestamp - a.timestamp);
    return orders;
  }
);

const decorateMyOpenOrders = (orders) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order);
      order = decorateMyOpenOrder(order);
      return(order);
    })
  );
}

const decorateMyOpenOrder = (order) => {
  let orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";

  return({
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED
  });
};

/**********Price Chart**********/


export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded);

export const priceChartSelector = createSelector(
  filledOrders,
  (orders) => {
    // Sort orders by date ascending to compare history
    orders = orders.sort((a,b) => a.timestamp - b.timestamp);
    // Decorate orders - add display attributes
    orders = orders.map((o) => decorateOrder(o));
    // Get last 2 order for final price & price change
    let secondLastOrder, lastOrder;
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length);
    // get last order price
    const lastPrice = get(lastOrder, "tokenPrice", 0);
    // get second last order price
    const secondLastPrice = get(secondLastOrder, "tokenPrice", 0);

    return({
      lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? "+" : "-"),
      series: [{
        data: buildGraphData(orders)
      }]
    });
  }
);

const buildGraphData = (orders) => {
  // Group the orders by hour for the graph
  orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf("hour").format());
  // Get each hour where data exists
  const hours = Object.keys(orders);
  // Build the graph series
  const graphData = hours.map((hour) => {
    // Fetch all the orders from current hour
    const group = orders[hour];
    // Calculate price values - open, high, low, close
    const open = group[0]; // first order
    const high = maxBy(group, "tokenPrice"); // high price
    const low = minBy(group, "tokenPrice"); // low price
    const close = group[group.length - 1]; // last order

    return({
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
    })
  });

  return graphData;
};

const orderCancelling = state => get(state, "exchange.orderCancelling", false)
export const orderCancellingSelector = createSelector(orderCancelling, status => status);

const orderFilling = state => get(state, 'exchange.orderFilling', false)
export const orderFillingSelector = createSelector(orderFilling, status => status)

// // BALANCES
// const balancesLoading = state => get(state, 'exchange.balancesLoading', true)
// export const balancesLoadingSelector = createSelector(balancesLoading, status => status)

// const etherBalance = state => get(state, 'web3.balance', 0)
// export const etherBalanceSelector = createSelector(
//   etherBalance,
//   (balance) => {
//     return formatBalance(balance)
//   }
// )

// const tokenBalance = state => get(state, 'token.balance', 0)
// export const tokenBalanceSelector = createSelector(
//   tokenBalance,
//   (balance) => {
//     return formatBalance(balance)
//   }
// )

// const exchangeEtherBalance = state => get(state, 'exchange.etherBalance', 0)
// export const exchangeEtherBalanceSelector = createSelector(
//   exchangeEtherBalance,
//   (balance) => {
//     return formatBalance(balance)
//   }
// )

// const exchangeTokenBalance = state => get(state, 'exchange.tokenBalance', 0)
// export const exchangeTokenBalanceSelector = createSelector(
//   exchangeTokenBalance,
//   (balance) => {
//     return formatBalance(balance)
//   }
// )

// const etherDepositAmount = state => get(state, 'exchange.etherDepositAmount', null)
// export const etherDepositAmountSelector = createSelector(etherDepositAmount, amount => amount)

// const etherWithdrawAmount = state => get(state, 'exchange.etherWithdrawAmount', null)
// export const etherWithdrawAmountSelector = createSelector(etherWithdrawAmount, amount => amount)

// const tokenDepositAmount = state => get(state, 'exchange.tokenDepositAmount', null)
// export const tokenDepositAmountSelector = createSelector(tokenDepositAmount, amount => amount)

// const tokenWithdrawAmount = state => get(state, 'exchange.tokenWithdrawAmount', null)
// export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount, amount => amount)

// const buyOrder = state => get(state, 'exchange.buyOrder', {})
// export const buyOrderSelector = createSelector(buyOrder, order => order)

// const sellOrder = state => get(state, 'exchange.sellOrder', {})
// export const sellOrderSelector = createSelector(sellOrder, order => order)

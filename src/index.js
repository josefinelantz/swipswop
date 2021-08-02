import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import "bootstrap/dist/css/bootstrap.css";
import { Provider } from "react-redux";
import actions from "./store/actions";
import { createStore, applyMiddleware, compose } from "redux";
import { createLogger } from "redux-logger";
import configureStore from "./store/configureStore";
import reportWebVitals from "./reportWebVitals";

// const loggerMiddleware = createLogger();
// const middleware = [];

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// // Create Redux Store
// const store = createStore(
//   reducers, 
//   ["preloadedState"], 
//   composeEnhancers(applyMiddleware(...middleware, loggerMiddleware))
// );
// Redux Provider exposes the store to react.
ReactDOM.render(
  <Provider store={configureStore()}>
    <App />
  </Provider>,
  document.getElementById("root"));
  
reportWebVitals();

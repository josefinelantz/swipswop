import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.css";
import App from "./components/App";
import { Provider } from "react-redux";
import actions from "./store/actions";
import { createStore, applyMiddleware, compose } from "redux";
import { createLogger } from "redux-logger";
import configureStore from "./store/configureStore";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <Provider store={configureStore()}>
    <App />
  </Provider>,
  document.getElementById("root"));
  
reportWebVitals();

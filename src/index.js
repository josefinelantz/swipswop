import React from "react";
import ReactDOM, { render } from "react-dom";
import App from "./components/App";
import { Provider } from "react-redux";
import "bootstrap/dist/css/bootstrap.css";
import reportWebVitals from "./reportWebVitals";
import configureStore from "./store/configureStore";

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
reportWebVitals();

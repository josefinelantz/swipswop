import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import "bootstrap/dist/css/bootstrap.css";
import { StoreProvider } from "./store";
import reportWebVitals from "./reportWebVitals";


ReactDOM.render(
<StoreProvider>
  <App />
</StoreProvider>,
  document.getElementById("root"));
  
reportWebVitals();

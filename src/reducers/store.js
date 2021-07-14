import React, { useReducer, useContext, createContext } from "react";

const StoreContext = createContext();
const initialState = {
  account: "",
  token: {},
  ethBalance: "0",
	tokenBalance: "0",
	loading: true 
};

const reducer = (state, action) => {
  switch (action.type) {
    case "NEW-ACCOUNT":
      return {
        ...state,
        account: action.account 
    	};
    case "SET-BALANCE":
      return {
        ...state,
        balance: action.balance
      };
    default:
      throw new Error(`Unknown type of action ${action.type}`)
  }
};
export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};
export const useStore = () => useContext(StoreContext);

import { useStore } from "../reducers/store";

export const useStoreApi = () => {
  const { state, dispatch } = useStore();

  return {
		account: state.account,
    token: state.token,
    ethBalance: state.ethBalance,
    tokenBalance: state.tokenBalance,
		setAccount: (account) => {
      dispatch({
        type: "NEW-TOKEN-BALANCE",
        account
      });
		},
		setToken: (token) => {
      dispatch({
        type: "NEW-TOKEN",
        token
      });
		},
    setEthBalance: ( ethBalance ) => {
      dispatch({
        type: "NEW-ETH-BALANCE",
        ethBalance
      });
    },
    setTokenBalance: (tokenBalance) => {
      dispatch({
        type: "NEW-TOKEN-BALANCE",
        tokenBalance
      });
    }
  };
};

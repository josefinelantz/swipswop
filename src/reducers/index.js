import { combineReducers } from "redux";

function web3Reducer(state = {}, action) {
	switch (action.type) {
		case "WEB3_LOADED":
			return { ...state, connection: action.connection };
		case "WEB3_ACCOUNT_LOADED":
			return { ...state, account: action.account };
		default:
			return state;
	}
}

export default combineReducers({
	web3Reducer
});
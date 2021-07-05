import { 
	web3Loaded 
} from "./actions";
import Web3 from "web3"; 

export const loadWeb3 = (dispatch) => {
	return new Web3(Web3.givenProvider || "http://localhost:7545");
	dispatch(web3Loaded(this));
}
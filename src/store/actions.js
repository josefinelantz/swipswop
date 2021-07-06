export function web3Loaded(connection) {
	return {
		type: "WEB3_LOADED",
		connection: connection
	}
}

export function web3AccountLoaded(account) {
	return {
		type: "WEB3_ACCOUNT_LOADED",
		account: account
	}
}

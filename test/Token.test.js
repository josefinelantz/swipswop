const Token = artifacts.require("Token");

require("chai")
	.use(require("chai-as-promised"))
	.should()

contract("Token", (accounts) => {
	const name = "DApp Token"
	const symbol = "DAPP"
	const decimals = "18"
	// Has to be checked as a string to big number for JavaScript. 
	const totalSupply = "1000000000000000000000000"
	let token;
	let result;

	beforeEach(async () => {
		// Fetch token from blockchain. 
		token = await Token.new()
	})

	describe("deployment", () => {
		it("tracks the name", async () => {
			// Read token name here...
			result = await token.name() 
			// The token name is .....
			result.should.equal(name)
		})

		it("tracks the symbol", async () => {
			// Read token symbol
			result = await token.symbol() 
			// The token symbol is .....
			result.should.equal(symbol)

		})

		it("tracks the decimals", async () => {
			// Read token decimals here...
			result = await token.decimals() 
			// The token name is .....
			result.toString().should.equal(decimals)
			
		})

		it("tracks the total supply", async () => {
			// Read token total supply here...
			result = await token.totalSupply() 
			// The token name is .....
			result.toString().should.equal(totalSupply)
			
		})
	})

})


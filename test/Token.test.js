const Token = artifacts.require("Token");

require("chai")
	.use(require("chai-as-promised"))
	.should()

contract("Token", (accounts) => {

	describe("deployment", () => {
		it("tracks the name", async () => {
			// Fetch token from blockchain. 
			const token = await Token.new()
			// Read token name here...
			const result = await token.name() 
			// The token name is .....
			result.should.equal("My Token")
		})
	})

})


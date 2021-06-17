import { tokens, EVM_REVERT } from "./helpers";

const Token = artifacts.require("Token");

require("chai")
	.use(require("chai-as-promised"))
	.should()

contract("Token", ([deployer, receiver]) => {
	const name = "DApp Token"
	const symbol = "DAPP"
	const decimals = "18"
	// Has to be checked as a string to big number for JavaScript. 
	const totalSupply = tokens(1000000)
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
			result.toString().should.equal(totalSupply.toString())
		})

		it("assigns the total supply to the deployer", async () => {
			const result = await token.balanceOf(deployer)
			result.toString().should.equal(totalSupply.toString())
		})
	})

	describe("sending tokens", () => {
		let amount
		let result

		describe("success", async () => {
			beforeEach(async () => {
				amount = tokens(100)
				result = await token.transfer(receiver, amount, { from: deployer })
			})
			it("transfers token balances", async () => {
				let balanceOf
				balanceOf = await token.balanceOf(deployer)
				balanceOf.toString().should.equal(tokens(999900).toString())
				balanceOf = await token.balanceOf(receiver)
				balanceOf.toString().should.equal(tokens(100).toString())
			})
	
			it("emits a transfer event", async() => {
				 const log = result.logs[0]
				log.event.should.equal("Transfer")
				const event = log.args
				event.from.should.equal(deployer, "from is correct")
				event.to.should.equal(receiver, "to is correct")
				event.value.toString().should.equal(amount.toString(), "value is correct")
			})
		})

		describe("failure", async => {	

			it("rejects insufficient balances", async () => {
				let invalidAmount
				invalidAmount = tokens(100000000) // Greater than totalSupply, hence invalid
				await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT);

				invalidAmount = tokens(10) // Receiver has no tokens
				await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejected
			})

			it("rejects invalid recipients", async () => {
				await token.transfer(0x0, amount, { from: deployer }).should.be.rejected
			})
		})
	})
})


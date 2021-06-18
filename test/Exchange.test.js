import { should } from "chai";
import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from "./helpers";

const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

require("chai")
	.use(require("chai-as-promised"))
	.should()

contract("Exchange", ([deployer, feeAccount, user1]) => {
	let token
	let exchange 
	const feePercent = 10;
	let result

	beforeEach(async () => {
		// Deploy token
		token = await Token.new();
		// Deploy exchange
		exchange = await Exchange.new(feeAccount, feePercent)
		// Transfer tokens to user 1
		token.transfer(user1, tokens(100), { from: deployer })
	})

	describe("deployment", () => {
		let result
		it("tracks the fee account", async () => {
			result = await exchange.feeAccount() 
			result.should.equal(feeAccount)
		})

		it("tracks the fee percent", async () => {
			result = await exchange.feePercent() 
			result.toString().should.equal(feePercent.toString())
		})
	})

	describe("fallback", () => {
		it("reverts when Ether is sent", async () => {
			await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT)
		})
	})

	describe("depositing ether", async () => {
		let result
		let amount

		beforeEach(async () => {
			amount = ether(1)
			result = await exchange.depositEther({ from: user1, value: amount} )
		})
		
		it("tracks the Ether deposit", async () => {
			// Check the token balance
			const balance = await exchange.tokens(ETHER_ADDRESS, user1)
			balance.toString().should.equal(amount.toString())
		})

		it("emits a Deposit event", async () => {
			const log = result.logs[0]
			log.event.should.eq("Deposit")
			const event = log.args
			event.token.should.equal(ETHER_ADDRESS, "token address is correct")
			event.user.should.equal(user1, "user address is correct")
			event.amount.toString().should.equal(amount.toString(), "amount is correct")
			event.balance.toString().should.equal(amount.toString(), "balance is correct")
		})
	})

	describe("withdrawing ether", async () => {
		let result
		let amount

		beforeEach(async () => {
			amount = ether(1)
			// Deposit Ether first
			await exchange.depositEther({ from: user1, value: amount })
		})
		
		describe("success", async () => {
			beforeEach(async () => {
				// Withdraw Ether
				result = await exchange.withdrawEther(amount, { from: user1 })
			})
			it("withdraws ether funds", async () => {
				const balance = await exchange.tokens(ETHER_ADDRESS, user1)
				balance.toString().should.equal("0")
			})

			it("emits a Withdraw event", async () => {
				const log = result.logs[0]
				log.event.should.eq("Withdraw")
				const event = log.args
				event.token.should.equal(ETHER_ADDRESS, "token address is correct")
				event.user.should.equal(user1, "user address is correct")
				event.amount.toString().should.equal(amount.toString(), "amount is correct")
				event.balance.toString().should.equal("0", "balance is correct")
			})
		})

		describe("failure", async () => {
			it("rejects withdraws for insufficient balances", async() => {
				await exchange.withdrawEther(ether(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
			})
		})
		
	})

	describe("depositing tokens", () => {
		let amount
		let result
		
		describe("success", () => {
			beforeEach(async () => {
				amount = tokens(10)
				await token.approve(exchange.address, amount, { from: user1} )
				result = await exchange.depositToken(token.address, amount, { from: user1 })
			})

			it("tracks the token deposit", async () => {
				// Check the token balance
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString())
				balance = await exchange.tokens(token.address, user1)
				balance.toString().should.equal(amount.toString())
			})

			it("emits a Deposit event", async () => {
				const log = result.logs[0]
				log.event.should.eq("Deposit")
				const event = log.args
				event.token.should.equal(token.address, "token address is correct")
				event.user.should.equal(user1, "user address is correct")
				event.amount.toString().should.equal(amount.toString(), "amount is correct")
				event.balance.toString().should.equal(amount.toString(), "balance is correct")
			})
	 	})

		describe("failure", () => {
			it("rejects Ether deposits", async() => {
				await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejected 
			})
			it("fails when no tokens are approved", async () => {
				// Try depositing without approving before
				await exchange.depositToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
			})
			
	 	})
		
	})

	describe("withdrawing tokens", async () => {
		let result
		let amount

		describe("success", async() => {
			beforeEach(async () => {
				amount = tokens(10)
				// Approve tokens first
				await token.approve(exchange.address, amount, { from: user1 })
				// Deposit tokens
				await exchange.depositToken(token.address, amount, { from: user1 })

				// Withdraw tokens
				result = await exchange.withdrawToken(token.address, amount, { from: user1 })
			})

			it("withdraws token funds", async() => {
				const balance = await exchange.tokens(token.address, user1)
				balance.toString().should.equal("0")
			})

			it("emits a Withdraw event", async () => {
				const log = result.logs[0]
				log.event.should.eq("Withdraw")
				const event = log.args
				event.token.should.equal(token.address, "token address is correct")
				event.user.should.equal(user1, "user address is correct")
				event.amount.toString().should.equal(amount.toString(), "amount is correct")
				event.balance.toString().should.equal("0", "balance is correct")
			})
		})
		describe("failure", async () => {
			it("rejects Ether withdraws", async () => {
				await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
			})

			it("fails for insufficient balances", async () => {
				// Attempt to withdraw without depositing first
				await exchange.withdrawToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
			})
		})
	})
	describe("checking balances", async () => {
		beforeEach( async () => {
			await exchange.depositEther({ from: user1, value: ether(1) })
		})

		it("returns user balance", async () => {
			const balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
			balance.toString().should.equal(ether(1).toString())
		})
	})
})


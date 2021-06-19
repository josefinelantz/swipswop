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

	describe("making orders", async () => {
		let result
		let timestamp

		beforeEach(async () => {
			result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
		})

		it("tracks the newly created order", async () => {
			const orderCount = await exchange.orderCount()
			orderCount.toString().should.equal("1")
			const order = await exchange.orders("1") // Kolla varför fnuttar
			order.id.toString().should.equal("1", "id is correct")
			order.user.should.equal(user1, "user is correct")
			order.amountGet.toString().should.equal(tokens(1).toString(), "amountGet is correct")
			order.tokenGive.should.equal(ETHER_ADDRESS, "tokenGive is correct")
			order.amountGive.toString().should.equal(ether(1).toString(), "amountGive is correct")
			//console.log(order.timestamp.words)
			order.timestamp.length.should.equal(2, "timestamp is present")
		})

		it("emits an Order event", async () => {
			const log = result.logs[0]
			log.event.should.equal("Order")
			const event = log.args
			event.tokenGet.should.equal(token.address, "tokenGet is correct")
			event.amountGet.toString().should.equal(ether(1).toString(), "amountGet is correct")
			event.tokenGive.toString().should.equal(ETHER_ADDRESS, "tokenGive is correct")
			event.amountGive.toString().should.equal(tokens(1).toString(), "amountGive is correct")
			event.user.should.equal(user1, "user is correct")
		})
	})
})

// order.timestamp
// BN {
//   negative: 0,
//   words: [ 13486815, 24, <1 empty item> ],
//   length: 2,
//   red: null
// }

// order.timestamp.words
// [ 13486914, 24, <1 empty item> ]

// result.logs

// [
//   {
//     logIndex: 0,
//     transactionIndex: 0,
//     transactionHash: '0x235637a91a148399f3fb4887959b428563fff77b83f80edcdca5f66dd1ab8bf5',
//     blockHash: '0x8bbf414079aae4b96a5b533252fe122027b100406a5a3b36d6fa5860be6620c1',
//     blockNumber: 203,
//     address: '0x160e7c350A879aa4Fea16eA258160583A706eEf6',
//     type: 'mined',
//     id: 'log_f27696f9',
//     event: 'Order',
//     args: Result {
//       '0': [BN],
//       '1': '0x75357E4B3EAC02a900338111b8664F9f16d34225',
//       '2': '0xC10cF72e852F0A01698E219082043c6f14F2C5b1',
//       '3': [BN],
//       '4': '0x0000000000000000000000000000000000000000',
//       '5': [BN],
//       '6': [BN],
//       __length__: 7,
//       id: [BN],
//       user: '0x75357E4B3EAC02a900338111b8664F9f16d34225',
//       tokenGet: '0xC10cF72e852F0A01698E219082043c6f14F2C5b1',
//       amountGet: [BN],
//       tokenGive: '0x0000000000000000000000000000000000000000',
//       amountGive: [BN],
//       timestamp: [BN]
//     }
//   }
// ]

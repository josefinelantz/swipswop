import chai, { should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from "./helpers";

const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

chai.use(chaiAsPromised);
chai.should();

contract("Exchange", ([deployer, feeAccount, user1, user2]) => {
	let token;
	let exchange; 
	const feePercent = 10;
	let result;

	beforeEach(async () => {
		// Deploy token
		token = await Token.new();
		// Deploy exchange
		exchange = await Exchange.new(feeAccount, feePercent);
		// Transfer tokens to user 1
		token.transfer(user1, tokens(100), { from: deployer });
	});

	describe("deployment", () => {
		let result
		it("tracks the fee account", async () => {
			result = await exchange.feeAccount();
			result.should.equal(feeAccount)
		});

		it("tracks the fee percent", async () => {
			result = await exchange.feePercent();
			result.toString().should.equal(feePercent.toString());
		});
	});

	describe("fallback", () => {
		it("reverts when Ether is sent", async () => {
			await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT);
		});
	});

	describe("depositing ether", async () => {
		let result;
		let amount;

		beforeEach(async () => {
			amount = ether(10);
			result = await exchange.depositEther({ from: user1, value: amount} );
		});
		
		it("tracks the Ether deposit", async () => {
			// Check the token balance
			const balance = await exchange.tokens(ETHER_ADDRESS, user1)
			balance.toString().should.equal(amount.toString());
		});

		it("emits a Deposit event", async () => {
			const log = result.logs[0];
			log.event.should.eq("Deposit");
			const event = log.args;
			event.token.should.equal(ETHER_ADDRESS, "token address is correct");
			event.user.should.equal(user1, "user address is correct");
			event.amount.toString().should.equal(amount.toString(), "amount is correct");
			event.balance.toString().should.equal(amount.toString(), "balance is correct");
		});
	});

	describe("withdrawing ether", async () => {
		let result;
		let amount;

		beforeEach(async () => {
			amount = ether(1);
			// Deposit Ether first
			await exchange.depositEther({ from: user1, value: amount });
		});
		
		describe("success", async () => {
			beforeEach(async () => {
				// Withdraw Ether
				result = await exchange.withdrawEther(amount, { from: user1 });
			});
			it("withdraws ether funds", async () => {
				const balance = await exchange.tokens(ETHER_ADDRESS, user1);
				balance.toString().should.equal("0");
			});

			it("emits a Withdraw event", async () => {
				const log = result.logs[0];
				log.event.should.eq("Withdraw");
				const event = log.args;
				event.token.should.equal(ETHER_ADDRESS, "token address is correct");
				event.user.should.equal(user1, "user address is correct");
				event.amount.toString().should.equal(amount.toString(), "amount is correct");
				event.balance.toString().should.equal("0", "balance is correct");
			});
		});

		describe("failure", async () => {
			it("rejects withdraws for insufficient balances", async() => {
				await exchange.withdrawEther(ether(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
			});
		});
	});

	describe("depositing tokens", () => {
		let amount;
		let result;
		
		describe("success", () => {
			beforeEach(async () => {
				amount = tokens(10);
				await token.approve(exchange.address, amount, { from: user1} );
				result = await exchange.depositToken(token.address, amount, { from: user1 });
			});

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
			const order = await exchange.orders(1) // Kolla varf??r fnuttar
			order.id.toString().should.equal("1", "id is correct")
			order.user.should.equal(user1, "user is correct")
			order.amountGet.toString().should.equal(tokens(1).toString(), "amountGet is correct")
			order.tokenGive.should.equal(ETHER_ADDRESS, "tokenGive is correct")
			order.amountGive.toString().should.equal(ether(1).toString(), "amountGive is correct")
			order.timestamp.length.should.equal(2, "timestamp is present")
		})

		it("emits an Order event", async () => {
			const log = result.logs[0]
			log.event.should.equal("Order")
			const event = log.args
			event.id.toString().should.equal("1", "id is correct")
			event.tokenGet.should.equal(token.address, "tokenGet is correct")
			event.amountGet.toString().should.equal(tokens(1).toString(), "amountGet is correct")
			event.tokenGive.toString().should.equal(ETHER_ADDRESS, "tokenGive is correct")
			event.amountGive.toString().should.equal(ether(1).toString(), "amountGive is correct")
			event.user.should.equal(user1, "user is correct")
		})
	})

	describe("order actions", async () => {

		beforeEach(async () => {
			// User1 deposits ether only
			await exchange.depositEther({ from: user1, value: ether(1) })
			// Give tokens to user2
			await token.transfer(user2, tokens(100), { from: deployer })
			// User2 deposits tokens only
			await token.approve(exchange.address, tokens(2), { from: user2 })
			await exchange.depositToken(token.address, tokens(2), { from: user2 })
			// User1 makes an order to buy tokens with Ether
			await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 })
		})

		describe("filling orders", async () => {
			let result
			
			describe("success", async () => {
				beforeEach(async () => {
					// User2 fills order
					result = await exchange.fillOrder(1, { from: user2 })
				})

			  it("executes the trade & charges fees", async () => {
					let balance
				 	balance = await exchange.balanceOf(token.address, user1)
					balance.toString().should.equal(tokens(1).toString(), "user1 received tokens")
				  balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
				  balance.toString().should.equal(ether(1).toString(), "user2 received Ether")
				  balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
				  balance.toString().should.equal("0", "user2 Ether deducted")
				  balance = await exchange.balanceOf(token.address, user2)
				  balance.toString().should.equal(tokens(0.9).toString(), "user2 tokens deducted with fee applied")
				
				  balance = await exchange.balanceOf(token.address, feeAccount)
				  balance.toString().should.equal(tokens(0.1).toString(), "feeAccount received fee")
				})

				it("updates filled orders", async () => {
					const orderFilled = await exchange.orderFilled(1)
					orderFilled.should.equal(true)
				})

				it("emits a Trade event", async () => {
					const log = result.logs[0]
					log.event.should.equal("Trade")
					const event = log.args
					event.id.toString().should.equal("1", "id is correct")
					event.tokenGet.should.equal(token.address, "tokenGet is correct")
					event.amountGet.toString().should.equal(ether(1).toString(), "amountGet is correct")
					event.tokenGive.toString().should.equal(ETHER_ADDRESS, "tokenGive is correct")
					event.amountGive.toString().should.equal(tokens(1).toString(), "amountGive is correct")
					event.userFill.should.equal(user2, "userFill is correct")
				})
			})
		})

		describe("cancelling orders", async () => {
			let Result;

			describe("success", async () => {
				beforeEach(async () => {
					result = await exchange.cancelOrder("1", { from: user1 });
				});

				it("updates cancelled orders", async () => {
					const orderCancelled = await exchange.orderCancelled(1);
					orderCancelled.should.equal(true);
				});

				it("emits an Cancel event", async () => {
					const log = result.logs[0]
					log.event.should.eq("Cancel");
					const event = log.args
					event.id.toString().should.equal("1", "id is correct")
					event.tokenGet.should.equal(token.address, "tokenGet is correct");
					event.amountGet.toString().should.equal(ether(1).toString(), "amountGet is correct");
					event.tokenGive.toString().should.equal(ETHER_ADDRESS, "tokenGive is correct");
					event.amountGive.toString().should.equal(tokens(1).toString(), "amountGive is correct");
					event.user.should.equal(user1, "user is correct")
					assert(event.timestamp != null);
				});
			});
			describe("failure", async () => {
				it("rejects invalid order ids", async () => {
					const invalidOrderId = 99999;
					await exchange.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejected;
				});

				it("rejects unauthorized cancellations", async () => {
					// Try to cancel the order from another user
					await exchange.cancelOrder(1, { from: user2 }).should.be.rejected;
				});
			});
		});
	});
});
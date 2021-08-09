import chai, { should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { tokens, EVM_REVERT } from "./helpers";
const Token = artifacts.require("Token");

chai.use(chaiAsPromised);
chai.should();

contract("Token", async ([tokenOwner, receiver, exchange]) => {
	const name = "Camel Token";
	const symbol = "CAMEL";
	const decimals = "18";
	const totalSupply = tokens(1000000).toString();
	let token;

	beforeEach(async () => {
		token = await Token.new();
	});

		describe("deployment", () => {
			let result;
			it("tracks the name", async () => {
	 			//Read token name here...
	 			result = await token.name();
	 			//The token name is .....
	 			result.should.equal(name);
			});

			it("tracks the symbol", async () => {
	 			//Read token symbol here...
	 			result = await token.symbol();
	 			//The token name is .....
	 			result.should.equal(symbol);
			});

			it("tracks the decimals", async () => {
				// Read token decimals here...
				result = await token.decimals();
				// The token decimals.....
				result.toString().should.equal(decimals);
		});

		it("tracks the total supply", async () => {
			// Read token total supply here...
			result = await token.totalSupply(); 
			// The total supply is .....
			result.toString().should.equal(totalSupply.toString());
		});

		it("assigns the total supply to the tokenOwner", async () => {
			result = await token.balanceOf(tokenOwner);
			result.toString().should.equal(totalSupply.toString());
		});
	});

	describe("sending tokens", () => {
	 	let amount;
	 	let result;
		 describe("success", () => {
			 beforeEach(async () => {
				 amount = tokens(100);
				 result = await token.transfer(receiver, amount, { from: tokenOwner });
			 });
	 		it("transfers token balances", async () => {
	 			let balance;
				balance = await token.balanceOf(tokenOwner);
	 			balance.toString().should.equal(tokens(999900).toString());
	 			balance = await token.balanceOf(receiver);
				balance.toString().should.equal(tokens(100).toString());
	 		});
	
	 		it("emits a transfer event", async() => {
				const log = result.logs[0];
	 			log.event.should.eq("Transfer");
	 			const event = log.args;
				event.from.should.equal(tokenOwner, "from is correct");
	 			event.to.should.equal(receiver, "to is correct");
	 			event.tokens.toString().should.equal(amount.toString(), "value is correct");
	 		});
	 	});

		describe("failure", async => {	

			it("rejects insufficient amounts", async () => {
				let invalidAmount = tokens(100000000); // Greater than totalSupply, hence invalid
				await token.transferFrom(tokenOwner, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT);

				invalidAmount = tokens(10); // Receiver has no tokens
				await token.transfer(tokenOwner, invalidAmount, { from: receiver }).should.be.rejected
			});

			it("rejects invalid recipients", async () => {
				await token.transferFrom(tokenOwner, 0x0, amount, { from: exchange }).should.be.rejected
			});
		});
	});


	describe("approving tokens", async () => {
		let result;
		let amount;

		beforeEach(async () => {
			amount = tokens(100);
			//For exchange what is the allowance approved by deployer?
			result = await token.approve(exchange, amount, { from: tokenOwner });
		});

		describe("success", () => {
			it("allocates an allowance for delegated token spending on exchange", async () => {
				const allowance = await token.allowance(tokenOwner, exchange);
				allowance.toString().should.equal(amount.toString());
			});

			it("emits an approval event", async () => {
				const log = result.logs[0];
				log.event.should.eq("Approval");
				const event = log.args;
				event.owner.toString().should.equal(tokenOwner, "owner is correct");
				event.spender.should.equal(exchange, "spender is correct");					
				event.tokens.toString().should.equal(amount.toString());
			});
		});

		describe("failure", () => {
				it("rejects invalid spenders", async () => {
					await token.approve(0x0, amount, { from: tokenOwner }).should.be.rejected
			});
		});

		describe("delegated token transfers", () => {
			let amount;
			let result;
		
			beforeEach(async () => {
				amount = tokens(100);
				await token.approve(exchange, amount, { from: tokenOwner });
			});
		
			describe("success", async () => {
				beforeEach(async () => {
					result = await token.transferFrom(tokenOwner, receiver, amount ,{ from: exchange });
				});
				it("transfers token balances", async () => {
					let balanceOf;
					balanceOf = await token.balanceOf(tokenOwner);
					balanceOf.toString().should.equal(tokens(999900).toString());
					balanceOf = await token.balanceOf(receiver);
					balanceOf.toString().should.equal(tokens(100).toString());
				});
		
				it("resets the allowance", async () => {
					const allowance = await token.allowance(tokenOwner, exchange);
					allowance.toString().should.equal("0");
				});
		
				it("emits a Transfer event", async() => {
					const log = result.logs[0]
					log.event.should.eq("Transfer");
					const event = log.args						
					event.from.toString().should.equal(tokenOwner, "from is correct");
					event.to.should.equal(receiver, "to is correct");
					event.tokens.toString().should.equal(amount.toString(), "value is correct");
				});
			});
		
			describe("failure", async => {	
				let invalidAmount
				it("rejects insufficient balances", async () => {
					invalidAmount = tokens(100000000); // Greater than totalSupply, hence invalid
					await token.transferFrom(tokenOwner, receiver, invalidAmount , { from: exchange }).should.be.rejected	
				});

				it("rejects invalid recipients", async () => {	
					await token.transferFrom(tokenOwner, 0x0, invalidAmount , { from: exchange }).should.be.rejected	
				});
			});
		});
	});
});


import { should } from "chai";
import { tokens, EVM_REVERT } from "./helpers";

const Exchange = artifacts.require("Exchange");

require("chai")
	.use(require("chai-as-promised"))
	.should()

contract("Exchange", ([deployer, feeAccount]) => {
	let exchange 
	const feePercent = 10;
	let result

	beforeEach(async () => {
		exchange = await Exchange.new(feeAccount, feePercent)
	})

	describe("deployment", () => {
		it("tracks the fee account", async () => {
			result = await exchange.feeAccount() 
			result.should.equal(feeAccount)
		})

		it("tracks the fee percent", async () => {
			result = await exchange.feePercent() 
			result.toString().should.equal(feePercent.toString())
		})
	})
})


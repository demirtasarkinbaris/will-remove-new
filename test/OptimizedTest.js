const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BitLucky", function () {
	let BitLucky;
	let bitLucky;
	let owner;
	let user1;
	let usdtToken;

	beforeEach(async function () {
		[owner, user1] = await ethers.getSigners();

		const bitluckyRandomnessContractAddress =
			"0xc3109f02af9FCe3576f09639324E46Ed7caBb90E";

		// Deploy the BitLucky contract
		BitLucky = await ethers.getContractFactory("OptimizedBitLucky");
		bitLucky = await BitLucky.deploy(bitluckyRandomnessContractAddress);
		await bitLucky.deployed();

		// Deploy a mock USDT token (you may need to replace this with the actual USDT token address)
		const UsdtToken = await ethers.getContractFactory("testUSDT");
		usdtToken = await UsdtToken.deploy();
		await usdtToken.deployed();

		// Mint some USDT tokens for testing
		const initialBalance = ethers.utils.parseEther("1000");
		await usdtToken.mint(owner.address, initialBalance);
		await usdtToken.mint(user1.address, initialBalance);
	});

	it("should create a product", async function () {
		const productName = "Test Product";
		const productType = "Electronic";
		const ticketPrice = 100;
		const maxTickets = 100;
		const closedTimeMinutes = 10;
		const nftURI = "https://example.com/nft";

		await bitLucky
			.connect(owner)
			.createProduct(
				ticketPrice,
				maxTickets,
				closedTimeMinutes,
				productName,
				productType,
				nftURI
			);

		// Verify product creation and details

		// Check if the product count has increased
		const productCount = await bitLucky.productCount();
		expect(productCount).to.equal(1);

		// Fetch the product details
		const product = await bitLucky.products(productCount - 1);

		// Calculate the expected closed time
		const currentTime = Math.floor(Date.now() / 1000);
		const closedTime = currentTime + closedTimeMinutes * 60;

		// Verify product details
		expect(product.ticketPrice).to.equal(ticketPrice);
		expect(product.maxTickets).to.equal(maxTickets);
		expect(product.ticketsSold).to.equal(0);
		expect(product.productName).to.equal("Test Product");
		expect(product.productType).to.equal("Electronic");
		expect(product.isAllSold).to.equal(false);
		expect(product.productWinner).to.equal(
			"0x0000000000000000000000000000000000000000"
		);
		expect(product.closedTime).to.be.closeTo(closedTime, 10);
		expect(product.productName).to.equal(productName);

		// Verify the custom NFT URI
		const retrievedNftURI = await bitLucky.nftURIs(productCount - 1);
		expect(retrievedNftURI).to.equal(nftURI);

		// Verify the owner's balance of NFTs
		const tokenBalance = await bitLucky.balanceOf(
			owner.address,
			productCount - 1
		);
		expect(tokenBalance).to.equal(1);
	});

	it("should allow a user to buy tickets", async function () {
		// Create a product
		const ticketPrice = 10;
		const maxTickets = 10;
		const closedTime = 10;
		const productName = "Test Product";
		const productType = "Electronic";
		const nftURI = "https://example.com/nft";
		await bitLucky
			.connect(owner)
			.createProduct(
				ticketPrice,
				maxTickets,
				closedTime,
				productName,
				productType,
				nftURI
			);

		// Approve USDT spending for the user
		const totalCost = ticketPrice * 3;
		await usdtToken.connect(user1).approve(bitLucky.address, totalCost);

		// Buy tickets for the user
		await bitLucky.connect(user1).buyTickets(0, 3, usdtToken.address);

		// Verify that the user's balance of NFTs has increased
		const userNFTBalance = await bitLucky.balanceOf(user1.address, 0);
		expect(userNFTBalance.toNumber()).to.equal(3);
	});

	it("should update the closing time", async function () {
		// Create a product
		const ticketPrice = 100;
		const maxTickets = 10;
		const initialClosedTime = 10;
		const productName = "Test Product";
		const productType = "Electronic";
		const nftURI = "https://example.com/nft";
		await bitLucky
			.connect(owner)
			.createProduct(
				ticketPrice,
				maxTickets,
				initialClosedTime,
				productName,
				productType,
				nftURI
			);

		// Update the closing time
		const additionalTime = 10;
		await bitLucky.connect(owner).updateClosedTime(0, additionalTime);

		// Calculate the new closed time
		const currentTime = Math.floor(Date.now() / 1000);
		const oldClosedTime = currentTime + initialClosedTime * 60;
		const newClosedTime = oldClosedTime + additionalTime * 60;

		// Fetch the updated product details
		const updatedProduct = await bitLucky.products(0);

		// Verify that the closing time has been updated
		expect(updatedProduct.closedTime).to.be.closeTo(newClosedTime, 30);
	});

	it("should allow a user to claim a refund", async function () {
		// Create a product
		const ticketPrice = 10;
		const maxTickets = 10;
		const closedTime = 10;
		const productName = "Test Product";
		const productType = "Electronic";
		const nftURI = "https://example.com/nft";
		await bitLucky
			.connect(owner)
			.createProduct(
				ticketPrice,
				maxTickets,
				closedTime,
				productName,
				productType,
				nftURI
			);

		// Buy some tickets
		const totalCost = ticketPrice * 5;
		await usdtToken.connect(user1).approve(bitLucky.address, totalCost);
		await bitLucky.connect(user1).buyTickets(0, 5, usdtToken.address);

		// Increase the timestamp to make the raffle closed
		const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
		const MinutesToAdd = 11;
		const SecondsToAdd = MinutesToAdd * 60;
		await ethers.provider.send("evm_increaseTime", [SecondsToAdd]);
		await ethers.provider.send("evm_mine");

		// Get the updated timestamp
		const updatedTimestamp = (await ethers.provider.getBlock()).timestamp;
		expect(updatedTimestamp > currentTimestamp).to.be.true;

		// Claim a refund
		await bitLucky.connect(user1).refund(0, usdtToken.address);
	});

	it("should select a winner", async function () {
		// Create a product
		const ticketPrice = 10;
		const maxTickets = 10;
		const closedTime = 10;
		const productName = "Test Product";
		const productType = "Electronic";
		const nftURI = "https://example.com/nft";
		await bitLucky
			.connect(owner)
			.createProduct(
				ticketPrice,
				maxTickets,
				closedTime,
				productName,
				productType,
				nftURI
			);

		// Buy all available tickets
		const totalCost = ticketPrice * maxTickets;
		await usdtToken.connect(user1).approve(bitLucky.address, totalCost);
		await bitLucky.connect(user1).buyTickets(0, maxTickets, usdtToken.address);

		// Increase the timestamp to make the raffle closed
		const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
		const MinutesToAdd = 11;
		const SecondsToAdd = MinutesToAdd * 60;
		await ethers.provider.send("evm_increaseTime", [SecondsToAdd]);
		await ethers.provider.send("evm_mine");

		// Get the updated timestamp
		const updatedTimestamp = (await ethers.provider.getBlock()).timestamp;
		expect(updatedTimestamp > currentTimestamp).to.be.true;

		// Select a winner
		await bitLucky.connect(owner).selectWinner(0);
	});

	it("should handle full process: create product, buy all tickets, select winner, and withdraw", async function () {
		// Create a product
		const ticketPrice = 10;
		const maxTickets = 10;
		const closedTime = 10;
		const productName = "Test Product";
		const productType = "Electronic";
		const nftURI = "https://example.com/nft";
		await bitLucky
			.connect(owner)
			.createProduct(
				ticketPrice,
				maxTickets,
				closedTime,
				productName,
				productType,
				nftURI
			);

		// Buy all available tickets
		const totalCost = ticketPrice * maxTickets;
		await usdtToken.connect(user1).approve(bitLucky.address, totalCost);
		await bitLucky.connect(user1).buyTickets(0, maxTickets, usdtToken.address);

		// Increase the timestamp to make the raffle closed
		const currentTimestamp = (await ethers.provider.getBlock()).timestamp;
		const MinutesToAdd = 11;
		const SecondsToAdd = MinutesToAdd * 60;
		await ethers.provider.send("evm_increaseTime", [SecondsToAdd]);
		await ethers.provider.send("evm_mine");

		// Get the updated timestamp
		const updatedTimestamp = (await ethers.provider.getBlock()).timestamp;
		expect(updatedTimestamp > currentTimestamp).to.be.true;

		// Select a winner
		await bitLucky.connect(owner).selectWinner(0);

		// Withdraw USDT from the contract
		const contractUSDTBalanceBefore = await usdtToken.balanceOf(
			bitLucky.address
		);
		await bitLucky
			.connect(owner)
			.withdraw(contractUSDTBalanceBefore, usdtToken.address);

		// Verify the contract's USDT balance after withdrawal
		const contractUSDTBalanceAfter = await usdtToken.balanceOf(
			bitLucky.address
		);
		expect(contractUSDTBalanceAfter).to.equal(0);

		// Verify the owner's USDT balance after withdrawal
		// const ownerUSDTBalance = await usdtToken.balanceOf(owner.address);

		// console.log(ownerUSDTBalance);
	});
});

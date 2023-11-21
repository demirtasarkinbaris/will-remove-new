const hre = require("hardhat");

async function main() {
	const _subscriptionId = 6335;

	const BitLuckyRandomness = await hre.ethers.getContractFactory(
		"BitLuckyRandomness"
	);
	const bitluckyrandomness = await BitLuckyRandomness.deploy(_subscriptionId);

	await bitluckyrandomness.deployed();

	console.log(
		`BitluckyRandomness deployed and address is : ${bitluckyrandomness.address}`
	);

	console.log("Sleeping.....");
	// Wait for etherscan to notice that the contract has been deployed
	await sleep(60000);

	await hre.run("verify:verify", {
		address: bitluckyrandomness.address,
		constructorArguments: [_subscriptionId], // Pass constructor arguments
	});
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {
	const usdt = await hre.ethers.getContractFactory("testUSDT");
	const USDT = await usdt.deploy();

	await USDT.deployed();

	console.log(`USDT deployed and address is : ${USDT.address}`);

	console.log("Sleeping.....");
	// Wait for etherscan to notice that the contract has been deployed
	await sleep(80000);

	await hre.run("verify:verify", {
		address: USDT.address,
		constructorArguments: [],
	});
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

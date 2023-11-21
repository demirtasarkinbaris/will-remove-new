const hre = require("hardhat");

async function main() {
	const bitluckyRandomnessContractAddress =
		"0xc3109f02af9FCe3576f09639324E46Ed7caBb90E";

	const BitLucky = await hre.ethers.getContractFactory("BitLucky");
	const bitlucky = await BitLucky.deploy(bitluckyRandomnessContractAddress);

	await bitlucky.deployed();

	console.log(`Bitlucky deployed and address is : ${bitlucky.address}`);

	console.log("Sleeping.....");
	// Wait for etherscan to notice that the contract has been deployed
	await sleep(60000);

	await hre.run("verify:verify", {
		address: bitlucky.address,
		constructorArguments: [bitluckyRandomnessContractAddress],
	});
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

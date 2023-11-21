require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });
require("solidity-coverage");
require("hardhat-gas-reporter");
require("@typechain/hardhat");

const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POLYGONSCAN_KEY = process.env.POLYGONSCAN_KEY;

module.exports = {
	solidity: "0.8.19",
	networks: {
		mumbai: {
			url: QUICKNODE_HTTP_URL,
			accounts: [PRIVATE_KEY],
		},
	},
	etherscan: {
		apiKey: {
			polygonMumbai: POLYGONSCAN_KEY,
		},
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS ? true : false,
		outputFile: "gas-report.txt",
		currency: "TRY",
		coinmarketcap: process.env.coinMarketCap_API,
		token: "MATIC",
		noColors: true,
	},
	typechain: {
		outDir: "typechain",
		target: "ethers-v5",
	},
};

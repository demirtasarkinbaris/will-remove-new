import { ethers } from "ethers";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const Navigation = ({ account, setAccount }) => {
	// const connectHandler = async () => {
	// 	const accounts = await window.ethereum.request({
	// 		method: "eth_requestAccounts",
	// 	});
	// 	const account = ethers.utils.getAddress(accounts[0]);
	// 	setAccount(account);
	// };

	const { address } = useAccount();
	setAccount(address);

	return (
		<nav>
			<div className="nav__brand">
				<h1>BitLucky</h1>
			</div>

			{/* <input type="text" className="nav__search" /> */}
			{<div> </div>}

			{/* {account ? (
				<button type="button" className="nav__connect">
					{account.slice(0, 6) + "..." + account.slice(38, 42)}
				</button>
			) : (
				<button type="button" className="nav__connect" onClick={connectHandler}>
					Connect
				</button>
			)} */}

			<ConnectButton />

			<ul className="nav__links">
				<li>
					<a href="#Clothing & Jewelry">Clothing & Jewelry</a>
				</li>
				<li>
					<a href="#Electronics & Gadgets">Electronics & Gadgets</a>
				</li>
				<li>
					<a href="#Toys & Gaming">Toys & Gaming</a>
				</li>
			</ul>

			{/* <ul className="nav__links">
				<li>
					<a href="#Clothing & Jewelry">Open Raffle</a>
				</li>
				<li>
					<a href="#Electronics & Gadgets">Ended Raffle</a>
				</li>
				<li>
					<a href="#Toys & Gaming">Your Raffle</a>
				</li>
				<li>
					<a href="#Toys & Gaming">Your NFT's</a>
				</li>
			</ul> */}
		</nav>
	);
};

export default Navigation;

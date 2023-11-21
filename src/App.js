import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

// Components
import Navigation from "./components/Navigation";
import Section from "./components/Section";
import Product from "./components/Product";

// ABIs
import BitLuckyABI from "./abis/BitLucky.json";

// Config
import config from "./config.json";

const fetchContract = (signerOrProvider) => {
	const contract = new ethers.Contract(
		config[80001].bitLucky.address,
		BitLuckyABI,
		signerOrProvider
	);
	return contract;
};

function App() {
	const [provider, setProvider] = useState(null);
	const [bitLucky, setBitLucky] = useState(null);

	const [account, setAccount] = useState(null);

	const [electronics, setElectronics] = useState(null);
	const [clothing, setClothing] = useState(null);
	const [toys, setToys] = useState(null);

	const [product, setProduct] = useState({});
	const [toggle, setToggle] = useState(false);

	const togglePop = (product) => {
		setProduct(product);
		toggle ? setToggle(false) : setToggle(true);
	};

	const loadBlockchainData = async () => {
		const web3Modal = new Web3Modal();
		const connection = await web3Modal.connect();
		const provider = new ethers.providers.Web3Provider(connection);
		setProvider(provider);
		console.log(provider);
		const signer = provider.getSigner();
		console.log(signer);
		const contract = fetchContract(signer);

		const getContract = fetchContract(provider);

		setBitLucky(contract);

		console.log(bitLucky);

		const productCount = await getContract.productCount();

		const products = [];

		for (var i = 0; i < productCount; i++) {
			const product = await getContract.products(i);
			products.push(product);
		}

		const electronics = products.filter(
			(product) => product.productType === "electronics"
		);
		const clothing = products.filter(
			(product) => product.productType === "clothing"
		);
		const toys = products.filter((product) => product.productType === "toys");

		setElectronics(electronics);
		setClothing(clothing);
		setToys(toys);

		console.log(electronics);
	};

	useEffect(() => {
		loadBlockchainData();
	}, []);

	return (
		<div>
			<Navigation account={account} setAccount={setAccount} />

			{electronics && clothing && toys && (
				<>
					<Section
						title={"Clothing & Jewelry"}
						product={clothing}
						togglePop={togglePop}
					/>
					<Section
						title={"Electronics & Gadgets"}
						product={electronics}
						togglePop={togglePop}
					/>
					<Section
						title={"Toys & Gaming"}
						product={toys}
						togglePop={togglePop}
					/>
				</>
			)}

			{toggle && (
				<Product
					product={product}
					provider={provider}
					account={account}
					bitLucky={bitLucky}
					togglePop={togglePop}
				/>
			)}
		</div>
	);
}

export default App;

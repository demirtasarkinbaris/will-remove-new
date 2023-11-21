import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import close from "../assets/close.svg";

import cameraImage from "../assets/items/camera.jpeg";
import cubeImage from "../assets/items/cube.jpeg";
import droneImage from "../assets/items/drone.jpeg";
import headsetImage from "../assets/items/headset.jpeg";
import robotImage from "../assets/items/robot.jpeg";
import shoesImage from "../assets/items/shoes.jpeg";
import sunglassesImage from "../assets/items/sunglasses.jpeg";
import trainImage from "../assets/items/train.jpeg";
import watchImage from "../assets/items/watch.jpeg";
import phoneImage from "../assets/items/phone.jpeg";

import BitLuckyRandomnessABI from "../abis/BitLuckyRandomness.json";
import testUSDTABI from "../abis/testUSDT.json";
const testUSDTContractAddress = "0x2D1d298FAaE524E0AA0d1d1EFaf6B7D802f2c0E1";
const BitLuckyRandomnessAddress = "0xc3109f02af9FCe3576f09639324E46Ed7caBb90E";

const fetchContract = (signerOrProvider) => {
	const contract = new ethers.Contract(
		testUSDTContractAddress,
		testUSDTABI,
		signerOrProvider
	);
	return contract;
};

const fetchContractRandomness = (signerOrProvider) => {
	const contract = new ethers.Contract(
		BitLuckyRandomnessAddress,
		BitLuckyRandomnessABI,
		signerOrProvider
	);
	return contract;
};

const Product = ({ product, provider, account, bitLucky, togglePop }) => {
	const [ticketAmount, setTicketAmount] = useState(1);

	const handleTicketAmountChange = (event) => {
		const enteredAmount = parseInt(event.target.value, 10);
		setTicketAmount(isNaN(enteredAmount) ? 1 : enteredAmount);
	};

	const buyTicketHandler = async () => {
		try {
			const web3Modal = new Web3Modal();
			const connection = await web3Modal.connect();
			const provider = new ethers.providers.Web3Provider(connection);
			const signer = provider.getSigner();
			const contract = fetchContract(signer);

			console.log(contract);
			console.log(account);
			console.log(bitLucky.address);

			const tx = await contract.approve(
				bitLucky.address,
				product.ticketPrice * ticketAmount
			);

			await tx.wait();

			await new Promise((resolve) => setTimeout(resolve, 10000));

			const transaction = await bitLucky.buyTickets(
				product.productID,
				ticketAmount
			);

			await transaction.wait();

			setTicketSold(ticketSold + ticketAmount);
		} catch (error) {
			console.error("Error buying ticket:", error.message || error);
		}
	};

	const selectWinnerHandler = async () => {
		try {
			const web3Modal = new Web3Modal();
			const connection = await web3Modal.connect();
			const provider = new ethers.providers.Web3Provider(connection);
			const signer = provider.getSigner();
			const contractRandomness = fetchContractRandomness(signer);

			console.log(contractRandomness);

			const tx = await contractRandomness.getRandomNumbers();
			await tx.wait();

			await new Promise((resolve) => setTimeout(resolve, 30000));

			const transaction = await bitLucky.selectWinner(product.productID);
			await transaction.wait();
		} catch (error) {
			console.error(error.message);
		}
	};

	const [additionalTime, setAdditionalTime] = useState(0);

	const handleAdditionalTimeChange = (event) => {
		const enteredTime = parseInt(event.target.value, 10);
		setAdditionalTime(isNaN(enteredTime) ? 0 : enteredTime);
	};

	const updateClosedTimeHandler = async () => {
		try {
			const transaction = await bitLucky.updateClosedTime(
				product.productID,
				additionalTime
			);
			await transaction.wait();
		} catch (error) {
			console.error(error.message);
		}
	};

	const refundHandler = async () => {
		try {
			const transaction = await bitLucky.refund(product.productID);
			await transaction.wait();
		} catch (error) {
			console.error(error.message);
		}
	};

	const calculateCountdown = () => {
		const closedTime = new Date(product.closedTime * 1000);
		const now = new Date();
		const timeDifference = closedTime - now;

		// Check if the current time is after the closed time
		const isClosed = timeDifference <= 0;

		if (isClosed) {
			return {
				isClosed: true,
			};
		}

		const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
		const hours = Math.floor(
			(timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
		);
		const minutes = Math.floor(
			(timeDifference % (1000 * 60 * 60)) / (1000 * 60)
		);
		const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

		return {
			isClosed: false,
			days,
			hours,
			minutes,
			seconds,
		};
	};

	const [countdown, setCountdown] = useState(calculateCountdown());

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCountdown(calculateCountdown());
		}, 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, []);

	const imageImports = {
		camera: cameraImage,
		cube: cubeImage,
		drone: droneImage,
		headset: headsetImage,
		robot: robotImage,
		shoes: shoesImage,
		sunglasses: sunglassesImage,
		train: trainImage,
		watch: watchImage,
		phone: phoneImage,
	};

	const descriptions = {
		camera:
			"The Canon EOS M7 is a mirrorless camera with a 32.5 MP APS-C CMOS sensor and Dual Pixel CMOS AF II. It supports 4K60 10-bit video with HDR-PQ and C-Log 3. The camera offers a 30 fps electronic shutter and 15 fps mechanical shutter, a 2.36m-dot OLED EVF, a 1.6m-dot vari-angle touch LCD, sensor-shift 5-axis image stabilization, dual UHS-II memory card slots, Wi-Fi, and Bluetooth connectivity. The camera body weighs 530 grams.",
		drone:
			"The DJI Mavic 3 Drone is equipped with a dual-camera system featuring a 3-axis gimbal. It offers a 20MP 5.1K wide-angle 4/3 CMOS Hasselblad camera alongside a 28x hybrid zoom 12MP telephoto lens. With a flight time of up to 46 minutes and a transmission range of up to 9.3 miles, it includes a 360° obstacle avoidance system, 10-bit D-Log color profile and HNCS, 1080p60 live video streaming, and 8 GB of onboard storage. It comes with the RC-N1 OcuSync 2.0 remote controller.",
		cube: "The Rubik Cube is made from eco-friendly ABS material to prevent peeling. It does not have sticker labels, making it waterproof and fade-resistant. The surface has a matte finish. It features corner design with anti-POP feature for exceptional performance. The cross shaft design allows for smooth movements and a flawless gaming experience. It is non-sticky, smooth, and durable.",
		sunglasses:
			"The Maybacthe sunglasses, with product code GU036425, are from the brand Ray-Ban. They are designed for both men and women, making them unisex. These sunglasses are non-polarized and do not have mirrored lenses. They come in a bronze frame color with model number 0Rbr0101s. The product is made of metal and the dimensions are 59mm (lens width) x 11mm (bridge width) x 140mm (temple length).",
		headset:
			"This headset features a built-in microphone, black color, and operates using a wired connection with a Micro USB. It does not have noise cancellation, has an impedance of 32 Ohms, and weighs 285 grams. This headset does not include 3.5mm connectors.",
		robot:
			"Pokibot is an interactive robot that can dance, speak, and repeat sounds. It responds to various sound inputs like clicks, taps, claps, and more with different sounds and actions. You can convert your messages into robotic speech with this robot. Pokibot can also interact with other Silverlit brand robots like Maze Breaker & Macro Bot. For more information, please download the free app. Pokibot can be controlled using IOS & Android applications on mobile phones.",
		shoes:
			"The Jumpman MVP sneakers feature an embroidered Jumpman logo. They come in a white, off-noir, and black colorway with the style code DZ4475-100. Made in Vietnam.",
		train:
			"This battery-powered train and track set includes Thomas and Friends characters - Thomas, Vinç Crane, and Otoray Sandy. Children can use Vinç Crane's hook to load and unload cargo from Thomas's freight car. Otoray Sandy accompanies Vinç Crane in their adventures on this fun track set. You can connect this set to other Thomas & Friends track sets (except wooden ones) for endless adventure options (other track sets sold separately). Suitable for preschoolers aged 3 and above.",
		watch:
			"The CASIO Steel Business Watch is a stylish and versatile timepiece. It features a steel case and steel strap, with a case diameter ranging from 41mm to 46mm. The case and strap are both made of steel, giving the watch durability and a classic look. The case color is smoky (fume), and the strap is black. The watch has an analog mechanism with a round dial and a domed glass. It belongs to the Business collection and comes with no warranty. The design is a plain color with a black color scheme, making it suitable for various business environments.",
		phone:
			"iPhone 15 is a smart phone from Apple with powerful A16 Bionic processor, 48 MP camera, water resistance, fast charging, and a range of advanced features.",
	};

	const productDescription = descriptions[product.productName.toLowerCase()];

	const names = {
		camera: "Canon EOS M7 Camera",
		drone: "DJI Mavic 3 Drone",
		cube: "Rubik Cube",
		sunglasses: "Maybacthe Sunglasses",
		headset: "Razer Wired Black Headset ",
		robot: "Silverlit Pokibot Robot - Turquoise",
		shoes: "Jumpman MVP Sneakers",
		train: "Thomas & Friends Train Set",
		watch: "CASIO Steel Business Watch",
		phone: "iPhone 15",
	};

	const [ticketSold, setTicketSold] = useState(product.ticketsSold);

	useEffect(() => {
		setTicketSold(product.ticketsSold);
	}, [product.ticketsSold]);

	return (
		<div className="product">
			<div className="product__details">
				<div className="product__image">
					<img src={imageImports[product.productName]} alt="Product" />
				</div>
				<div className="product__overview">
					<h1 style={{ fontSize: "1.5em" }}>{names[product.productName]}</h1>

					<hr />

					<h2>Overview</h2>

					<p>{productDescription || "Urun aciklamas bulunamadi."}</p>

					<hr />

					<h2>
						{ethers.utils.formatUnits(product.ticketPrice.toString()) *
							10 ** 18}{" "}
						USDT
					</h2>
				</div>

				<div className="product__order">
					<h1 style={{ fontSize: "1.2em" }}>Closed Time</h1>
					{countdown.isClosed ? (
						<p style={{ fontSize: "0.8em" }}>Closed</p>
					) : (
						<p style={{ fontSize: "0.8em" }}>
							{countdown.days} days {countdown.hours} hours {countdown.minutes}{" "}
							minutes {countdown.seconds} seconds
						</p>
					)}
					<hr />
					<br />
					<h1 style={{ fontSize: "1.2em" }}>Ticket Sold</h1>
					<p style={{ fontSize: "0.8em" }}>{ticketSold}</p>
					<hr />
					<br />
					<h1 style={{ fontSize: "1.2em" }}>Max Ticket</h1>
					<p style={{ fontSize: "0.8em" }}>{product.maxTickets}</p>
					<hr />
					<br />

					{account !== "0x34e365769790760B11CE7ff781A373AC7E4D86bD" && (
						<div>
							<label htmlFor="ticketAmount">Ticket Amount:</label>
							<input
								type="number"
								id="ticketAmount"
								name="ticketAmount"
								min="1"
								value={ticketAmount}
								onChange={handleTicketAmountChange}
							/>
							<button
								className="product__buy"
								onClick={buyTicketHandler}
								disabled={product.isAllSold}>
								Buy Ticket
							</button>
						</div>
					)}

					{account !== "0x34e365769790760B11CE7ff781A373AC7E4D86bD" &&
						!product.isAllSold &&
						Date.now() > product.closedTime * 1000 && (
							<div>
								<hr />
								<br />
								<button className="product__buy" onClick={refundHandler}>
									Refund
								</button>
							</div>
						)}

					{account === "0x34e365769790760B11CE7ff781A373AC7E4D86bD" && (
						<div>
							<label htmlFor="additionalTime">Additional Time (in days):</label>
							<input
								type="number"
								id="additionalTime"
								name="additionalTime"
								min="0"
								value={additionalTime}
								onChange={handleAdditionalTimeChange}
							/>
							<button
								className="product__buy"
								onClick={updateClosedTimeHandler}>
								Update Closed Time
							</button>
						</div>
					)}

					<hr />
					<br />

					{account === "0x34e365769790760B11CE7ff781A373AC7E4D86bD" && (
						<button
							className="product__buy"
							onClick={selectWinnerHandler}
							disabled={!product.isAllSold}>
							Select Winner
						</button>
					)}
					<br />
				</div>

				<button onClick={togglePop} className="product__close">
					<img src={close} alt="Close" />
				</button>
			</div>
		</div>
	);
};

export default Product;

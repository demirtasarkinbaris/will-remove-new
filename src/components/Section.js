import { ethers } from "ethers";

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

const Section = ({ title, product, togglePop }) => {
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

	return (
		<div className="cards__section">
			<h3 id={title}>{title}</h3>

			<hr />

			<div className="cards">
				{product.map((product, index) => (
					<div className="card" key={index} onClick={() => togglePop(product)}>
						<div className="card__image">
							<img src={imageImports[product.productName]} alt="Item" />
						</div>
						<div className="card__info">
							<h5>{names[product.productName]}</h5>
							<p>
								{" "}
								{ethers.utils.formatUnits(product.ticketPrice.toString()) *
									10 ** 18}{" "}
								USDT
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Section;

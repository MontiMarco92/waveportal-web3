import * as React from "react";
import { ethers } from "ethers";
import "./App.css";

export default function App() {
	const wave = () => {};

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>

				<div className="bio">Start tweeting on the blockchain right now!</div>

				<button className="waveButton" onClick={wave}>
					Tell me something
				</button>
			</div>
		</div>
	);
}

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

export default function App() {
	const [currentAccount, setCurrentAccount] = useState("");

	const contractAddress = "0x56432236D6d3A4fE0e30d9c8606975c2892a1209";
	const contractABI = abi.abi;

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log("make sure you have metamasks!");
			} else {
				console.log("We have ethereum object", ethereum);
			}

			const accounts = await ethereum.request({ method: "eth_accounts" });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log("Found an authorized account:", account);
				setCurrentAccount(account);
			} else {
				console.log("No authorized account found");
			}
		} catch (err) {
			console.log(err);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				alert("get metamask");
				return;
			}

			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});
			console.log("connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (err) {
			console.log(err);
		}
	};

	const wave = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();
				console.log("retrieved total wave count...", count.toNumber());

				const waveTxn = await wavePortalContract.wave();
				console.log("Mining...", waveTxn.hash);

				await waveTxn.wait();
				console.log("mined", waveTxn.hash);
			} else {
				console.log("ethereum obj does not exist");
			}
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>

				<div className="bio">Start tweeting on the blockchain right now!</div>

				<button className="waveButton" onClick={wave}>
					Tell me something
				</button>

				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect wallet
					</button>
				)}
			</div>
		</div>
	);
}

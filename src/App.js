import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

export default function App() {
	const [currentAccount, setCurrentAccount] = useState("");
	const [allWaves, setAllWaves] = useState([]);
	const [msgText, setmsgText] = useState("");
	const [miningMsg, setMiningMsg] = useState(false);

	const contractAddress = "0x74a7D697e4AdEf71E9D55a1B0FDA95c40020F81e";
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
				getAllWaves();
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

				const waveTxn = await wavePortalContract.wave(msgText, {
					gasLimit: 300000,
				});
				setMiningMsg(true);
				console.log("Mining...", waveTxn.hash);
				setmsgText("");
				await waveTxn.wait();
				console.log("mined", waveTxn.hash);
				setMiningMsg(false);
			} else {
				console.log("ethereum obj does not exist");
			}
		} catch (err) {
			console.log(err);
		}
	};

	const getAllWaves = async () => {
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

				const waves = await wavePortalContract.getAllWaves();

				const wavesCleaned = waves.map((wave) => {
					return {
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message,
					};
				});

				setAllWaves(wavesCleaned);
			} else {
				console.log("ethereum obj does not exist");
			}
		} catch (err) {
			console.log(err);
		}
	};

	const handleChange = (e) => {
		setmsgText(e.target.value);
	};

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);
	useEffect(() => {
		let wavePortalContract;
		const onNewWave = (from, timestamp, message) => {
			console.log("NewWave", from, timestamp, message);
			setAllWaves((prevState) => [
				...prevState,
				{
					address: from,
					timestamp: new Date(timestamp * 1000),
					message: message,
				},
			]);
		};

		if (window.ethereum) {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();

			wavePortalContract = new ethers.Contract(
				contractAddress,
				contractABI,
				signer
			);
			wavePortalContract.on("NewWave", onNewWave);
		}

		return () => {
			if (wavePortalContract) {
				wavePortalContract.off("NewWave", onNewWave);
			}
		};
	}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>
				<div className="bio">Start tweeting on the blockchain right now!</div>
				<button
					className="waveButton"
					disabled={!currentAccount}
					onClick={wave}
				>
					Tell me something
				</button>
				<textarea className="newMsg" value={msgText} onChange={handleChange} />
				{miningMsg && (
					<div className="lds-facebook">
						<div></div>
						<div></div>
						<div></div>
					</div>
				)}

				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect wallet
					</button>
				)}
				{allWaves.map((wave, index) => {
					return (
						<div key={index} className="msgContainer">
							<div>Address: {wave.address}</div>
							<div>Time: {wave.timestamp.toString()}</div>
							<div>
								Message: <span className="msg">{wave.message}</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

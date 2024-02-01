import axios from "axios";
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 
 * @param {String} filePath 
 * @returns {String} fileContents
 */
const readFile = (filePath) => {
	const asboluteFilePath = path.join(__dirname, filePath);
	const fileContents = fs.readFileSync(asboluteFilePath, 'utf-8');
	return fileContents;
}

// Load ABI and ByteCode
const sharesABI = readFile('../contracts/ABI/Share.json'); // Shares ABI
const sharesBin = readFile('../contracts/ByteCode/Share.bin'); // Shares ByteCode

const coinsABI = readFile('../contracts/ABI/Coin.json'); // Coins ABI
const coinsBin = readFile('../contracts/ByteCode/Coin.bin'); // Coins ByteCode

const companyABI = readFile('../contracts/ABI/Company.json'); // Company ABI
const companyBin = readFile('../contracts/ByteCode/Company.bin'); // Company ByteCode

// Geters for ABI and ByteCode
const getSharesABI = () => {
	return JSON.parse(sharesABI);
};

const getSharesBin = () => {
	return sharesBin;
};

const getCoinsABI = () => {
	return JSON.parse(coinsABI);
};

const getCoinsBin = () => {
	return coinsBin;
};

const getCompanyABI = () => {
	return JSON.parse(companyABI);
};

const getCompanyBin = () => {
	return companyBin;
};


/**
 * @param {Object} payloadData
 * @param {Object} data
 * @param {Callback} callback
 */
const respondToServer = (payloadData, data, callback) => {
	console.log("=== RESPOND TO SERVER ===");
	let service = payloadData;
	let destination = service.datashopServerAddress + "/api/job/updateJob";
	let lambdaInput;
	if (data) {
		lambdaInput = {
			insightFileURL: service.dataFileURL,
			jobid: service.jobID,
			returnData: data,
		};
	} else {
		lambdaInput = {
			insightFileURL: "N/A", // failed job status
			jobid: service.jobID,
		};
	}
	axios
		.put(destination, lambdaInput)
		.then((res) => {
			callback(null, "Job responded");
		})
		.catch((e) => {
			callback(e, null);
		});
};

export {
	getSharesABI,
	getSharesBin,
	getCoinsABI,
	getCoinsBin,
	getCompanyABI,
	getCompanyBin,
	respondToServer
}
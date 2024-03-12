import axios from "axios";
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
const nftABI = readFile('../contracts/ABI/NFT.json'); // NFT ABI
const nftBin = readFile('../contracts/ByteCode/NFT.bin'); // NFT ByteCode

// Geters for ABI and ByteCode
const getNftABI = () => {
	return JSON.parse(nftABI);
};

const getNftBin = () => {
	return nftBin;
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
	getNftABI,
	getNftBin,
	respondToServer
}
import "dotenv/config";
import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { getSharesABI, getSharesBin, getCoinsABI, getCoinsBin, getCompanyABI, getCompanyBin, respondToServer } from "../../helpers/helperFunctions.js";
import Web3 from 'web3'; // Ethereum Interaction facilitator

// Setup
const provider = new Web3.providers.WebsocketProvider(process.env.SEPOLIA_RPC); // Set provider for sepolia node
const web3 = new Web3(provider); // Create web3 instance
const signer = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY); // Set signer from private key
web3.eth.accounts.wallet.add(signer); // Add signer to wallet

// Get contracts
const CompanyContract = new web3.eth.Contract(getCompanyABI(), { from: signer.address });
const CoinsContract = new web3.eth.Contract(getCoinsABI(), { from: signer.address });
const SharesContract = new web3.eth.Contract(getSharesABI(), { from: signer.address });

/**
 * @param {Object} payloadData
 * @param {String} payloadData.jobID
 * @param {String} payloadData.datashopServerAddress
 * @param {Object} payloadData.dataFileURL
 * @param {String} payloadData.dataFileURL.url
 * @param {Object} payloadData.dataFileURL.json
 * @param {String} payloadData.dataFileURL.json.companyName
 * @param {String} payloadData.dataFileURL.json.sharesName
 * @param {String} payloadData.dataFileURL.json.sharesSymbol
 * @param {Number} payloadData.dataFileURL.json.sharesQuantity
 * @param {Number} payloadData.dataFileURL.json.sharesDecimals
 * @param {String} payloadData.dataFileURL.json.coinsName
 * @param {String} payloadData.dataFileURL.json.coinsSymbol
 * @param {Number} payloadData.dataFileURL.json.coinsQuantity
 * @param {Number} payloadData.dataFileURL.json.coinsDecimals
 * @param {Array<Object>} payloadData.dataFileURL.json.founders
 * @param {String} payloadData.dataFileURL.json.founders.addr
 * @param {Number} payloadData.dataFileURL.json.founders.shares
 * @param {Function} callback
 */
const createCompany = (payloadData, callback) => {
	let companyContractAddress;
    let sharesContractAddress;
    let coinsContractAddress;

    let data = payloadData.dataFileURL.json;

    let companyName = data.companyName;
    let sharesName = data.sharesName;
    let sharesSymbol = data.sharesSymbol;
    let sharesQuantity = data.sharesQuantity;
    let sharesDecimals = data.sharesDecimals;
    let coinsName = data.coinsName;
    let coinsSymbol = data.coinsSymbol;
    let coinsQuantity = data.coinsQuantity;
    let coinsDecimals = data.coinsDecimals;
    let founders = data.founders;

    let _companyContractInstance;

	const tasks = {
		deployCompanyContract: async (cb) => {
            console.log("=== DEPLOY COMPANY CONTRACT ===");
            try {
                const args = [companyName, founders];

                const companyContractEstimatedGas = await CompanyContract.deploy({
                    data: getCompanyBin(),
                    arguments: args
                }).estimateGas();

                const companyContractInstance = await CompanyContract.deploy({
                    data: getCompanyBin(),
                    arguments: args
                }).send({
                    from: signer.address,
                    gas: companyContractEstimatedGas
                }).once("receipt", (receipt) => {
                    console.log(`Company contract creation transaction mined!`);
                });

                companyContractAddress = companyContractInstance.options.address;
                _companyContractInstance = companyContractInstance;
                console.log("Company Contract Address: ", companyContractAddress);
            } catch (err) {
				console.log(err);
				cb(ERROR.APP_ERROR);
			}
		},
        deploySharesContract: async (cb) => {
            console.log("=== DEPLOY SHARES CONTRACT ===");
            try {
                const args = [sharesName, sharesSymbol, sharesQuantity, sharesDecimals, companyContractAddress];

                const sharesContractEstimatedGas = await SharesContract.deploy({
                    data: getSharesBin(),
                    arguments: args
                }).estimateGas();

                const sharesContractInstance = await SharesContract.deploy({
                    data: getSharesBin(),
                    arguments: args
                }).send({
                    from: signer.address,
                    gas: sharesContractEstimatedGas
                }).once("receipt", (receipt) => {
                    console.log(`Shares contract creation transaction mined!`);
                });
                
                sharesContractAddress = sharesContractInstance.options.address;
                console.log("Shares Contract Address: ", sharesContractAddress);
            } catch (err) {
				console.log(err);
				cb(ERROR.APP_ERROR);
			}
        },
        deployCoinsContract: async (cb) => {
            console.log("=== DEPLOY COINS CONTRACT ===");
            try {
                const args = [coinsName, coinsSymbol, coinsQuantity, coinsDecimals];

                const coinsContractEstimatedGas = await CoinsContract.deploy({
                    data: getCoinsBin(),
                    arguments: args
                }).estimateGas();

                const coinsContractInstance = await CoinsContract.deploy({
                    data: getCoinsBin(),
                    arguments: args
                }).send({
                    from: signer.address,
                    gas: coinsContractEstimatedGas
                }).once("receipt", (receipt) => {
                    console.log(`Coins contract creation transaction mined!`);
                });
                
                coinsContractAddress = coinsContractInstance.options.address;
                console.log("Coins Contract Address: ", coinsContractAddress);
            } catch (err) {
				console.log(err);
				cb(ERROR.APP_ERROR);
			}
        },
        setupCompanyContract: async (cb) => {
            console.log("=== SETUP COMPANY CONTRACT ===");
            try {
				const tx = _companyContractInstance.methods.setup(sharesContractAddress, coinsContractAddress);
				await tx
					.send({
						from: signer.address,
						gas: await tx.estimateGas(),
					})
					.once("transactionHash", (txhash) => {
						console.log(`Mining company setup transaction ...`);
						console.log(`https://sepolia.etherscan.io/tx/${txhash}`);
					})
					.once("receipt", (receipt) => {
						console.log(`Company setup transaction mined!`);
					});
			} catch (err) {
				console.log(err);
				cb(ERROR.APP_ERROR);
			}
        }
	};
	async.series(tasks, (err, result) => {
		let returnData;
		if (err || !companyContractAddress || !sharesContractAddress || !coinsContractAddress) {
			// respond to server with error
			returnData = null;
		} else {
			// respond to server with success
			returnData = { companyContractAddress, sharesContractAddress, coinsContractAddress };
		}
		respondToServer(payloadData, returnData, (err, result) => {
			if (err) {
				console.log(err);
			} else {
				console.log(result);
			}
		});
	});
};

export default createCompany;

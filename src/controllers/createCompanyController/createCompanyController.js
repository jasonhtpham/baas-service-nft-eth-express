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
                const foundersTuple = founders.map(item => [item.addr, item.shares]);
                const args = [companyName, foundersTuple];

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
        setupCompanyContract: async (cb) => {
            console.log("=== SETUP COMPANY CONTRACT ===");
            try {
                const tx = _companyContractInstance.methods.setup(
                    sharesName, sharesSymbol, sharesQuantity, sharesDecimals,
                    coinsName, coinsSymbol, coinsQuantity, coinsDecimals
                );
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

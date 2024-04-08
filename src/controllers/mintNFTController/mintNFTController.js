import "dotenv/config";
import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { getNftABI, getNftBin, respondToServer } from "../../helpers/helperFunctions.js";
import Web3 from 'web3'; // Ethereum Interaction facilitator

// Setup
const provider = new Web3.providers.WebsocketProvider(process.env.SEPOLIA_RPC); // Set provider for sepolia node
const web3 = new Web3(provider); // Create web3 instance
const signer = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY); // Set signer from private key
web3.eth.accounts.wallet.add(signer); // Add signer to wallet

// Get contracts
const NftContract = new web3.eth.Contract(getNftABI(), process.env.MINTER_ADDRESS);



/**
 * @param {Object} payloadData
 * @param {String} payloadData.jobID
 * @param {String} payloadData.datashopServerAddress
 * @param {Object} payloadData.dataFileURL
 * @param {String} payloadData.dataFileURL.url
 * @param {Object} payloadData.dataFileURL.json
 * @param {String} payloadData.dataFileURL.json.receiver
 * @param {String} payloadData.dataFileURL.json.url
 * @param {Function} callback
 */
const mintNftIPFS = (payloadData, callback) => {
    let txId;

    let data = payloadData.dataFileURL.json;
    const receiver = Web3.utils.toChecksumAddress(data.receiver);
    const url = data.url;

    const tasks = {
        mintNft: async (cb) => {
            console.log("=== DEPLOY NFT SMART CONTRACT ===");
            try {

                const nftMintingEstimatedGas = await NftContract.methods.safeMint(receiver, url)
                    .estimateGas({
                        from: signer.address
                    });

                await NftContract.methods.safeMint(receiver, url).send({
                    from: signer.address,
                    gas: nftMintingEstimatedGas
                }).once("receipt", (receipt) => {
                    console.log(`NFT minting transaction mined!`);
                    txId = receipt.transactionHash;
                }).on('error', console.error);

            } catch (err) {
                console.log(err);
                cb(ERROR.APP_ERROR);
            }
        },
    };
    async.series(tasks, (err, _) => {
        let returnData;
        if (err || !txId) {
            // respond to server with error
            returnData = null;
            return callback(err)
        }
        // respond to server with success
        returnData = { txId };
        // callback(null, { returnData })
        respondToServer(payloadData, returnData, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });

    });
};

export default {
    mintNftIPFS: mintNftIPFS
};

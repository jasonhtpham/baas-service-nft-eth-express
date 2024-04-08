import UniversalFunctions from "../../utils/universalFunctions.js";
import Joi from "joi";
import Controller from "../../controllers/index.js";
const Config = UniversalFunctions.CONFIG;

const mintNftIPFS = {
	method: "POST",
	path: "/api/demo/mintNftExpress",
	options: {
		description: "mint a non fungible token using algorand to IPFS",
		tags: ["api"],
		handler: function (request, h) {
			var payloadData = request.payload;
			return new Promise((resolve, reject) => {
				Controller.MintNFTController.mintNftIPFS(payloadData, function (err, data) {
					if (err) reject(UniversalFunctions.sendError(err));
					else resolve(UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, data));
				});
			});
		},
		validate: {
			payload: Joi.object({
				jobID: Joi.string(),
				datashopServerAddress: Joi.string(),
				dataFileURL: Joi.object({
					url: Joi.any(),
					json: Joi.object({
						receiver: Joi.string().required(),
						url: Joi.string().required(),
					}),
				})
			}).label("Mint NFT Express"),
			failAction: UniversalFunctions.failActionFunction,
		},
		plugins: {
			"hapi-swagger": {
				responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages,
			},
		},
	},
};

export default [mintNftIPFS];

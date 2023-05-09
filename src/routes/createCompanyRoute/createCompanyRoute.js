import UniversalFunctions from "../../utils/universalFunctions.js";
import Joi from "joi";
import Controller from "../../controllers/index.js";
const Config = UniversalFunctions.CONFIG;

const createCompanyRoute = {
	method: "POST",
	path: "/api/demo/create_company",
	options: {
		description: "Create Company API",
		tags: ["api"],
		handler: function (request, h) {
			var payloadData = request.payload;
			Controller.createCompanyController(payloadData);
			return UniversalFunctions.sendSuccess(Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT, {});
		},
		validate: {
			payload: Joi.object({
				jobID: Joi.string(),
				datashopServerAddress: Joi.string(),
				dataFileURL: Joi.object({
					url: Joi.any(),
					json: Joi.object(
						{
                            companyName: Joi.string().required(),
                            sharesName: Joi.string().required(),
                            sharesSymbol: Joi.string().required(),
                            sharesQuantity: Joi.number().integer().required(),
                            sharesDecimals: Joi.number().integer().required(),
                            coinsName: Joi.string().required(),
                            coinsSymbol: Joi.string().required(),
                            coinsQuantity: Joi.number().integer().required(),
                            coinsDecimals: Joi.number().integer().required(),
                            founders: Joi.array().items(Joi.object(
                                {
                                    addr: Joi.string().required(),
                                    shares: Joi.number().integer().required()
                                }
                            )).required()
                        }
					).required(),
				}),
			}).label("Company Model"),
			failAction: UniversalFunctions.failActionFunction,
		},
		plugins: {
			"hapi-swagger": {
				responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages,
			},
		},
	},
};

export default [
	createCompanyRoute,
];

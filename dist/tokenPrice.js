"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenPrice = void 0;
const pricing_1 = require("./pricing");
const decimal_js_1 = __importDefault(require("decimal.js"));
class TokenPrice extends pricing_1.Pricing {
    /**
     * models price
     * @private
     * https://openai.com/pricing
     *
     * Model: [Input , Output, Train] ($/1K Tokens)
     */
    static get modelsPrice() {
        const generalModels = {};
        Object.entries(TokenPrice.generalModelMapping).forEach(([generalModel, incrementalModel]) => {
            generalModels[generalModel] = TokenPrice.incrementalModels[incrementalModel];
        });
        return Object.assign(Object.assign(Object.assign({}, generalModels), TokenPrice.incrementalModels), TokenPrice.fineTuningModels);
    }
    get inputPrice() {
        return (model, tokens = 1000) => this.calcPrice(TokenPrice.modelsPrice[this.modelFormat(model)][0], tokens);
    }
    get outputPrice() {
        return (model, tokens = 1000) => this.calcPrice(TokenPrice.modelsPrice[this.modelFormat(model)][1], tokens);
    }
    get totalPrice() {
        return (model, inputTokens, outputTokens) => {
            const inputPrice = this.inputPrice(model, inputTokens);
            const outputPrice = this.outputPrice(model, outputTokens);
            return new decimal_js_1.default(inputPrice).add(outputPrice).toNumber();
        };
    }
    get trainPrice() {
        return (model, tokens = 1000) => {
            const price = TokenPrice.modelsPrice[this.modelFormat(model)][2];
            if (price === undefined)
                throw new Error(`Model ${model} does not support training`);
            return this.calcPrice(price, tokens);
        };
    }
    get modelFormat() {
        return (model) => {
            return model.startsWith('ft:')
                ? Object.entries(TokenPrice.modelsPrice)
                    .find(([ftModel]) => model.includes(ftModel))[0]
                : model;
        };
    }
    get calcPrice() {
        return (price, tokens) => new decimal_js_1.default(price)
            .mul(tokens)
            .div(1000)
            .toNumber();
    }
}
exports.TokenPrice = TokenPrice;

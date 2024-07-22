"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pricing = void 0;
/**
 * Pricing
 * @class
 * https://openai.com/pricing
 */
class Pricing {
}
exports.Pricing = Pricing;
/**
 * General Model Mapping
 * @public
 * General Model => Incremental Model
 */
Pricing.generalModelMapping = {
    'gpt-3.5-turbo': 'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo-16k': 'gpt-3.5-turbo-0125',
    'gpt-4': 'gpt-4-0613',
    'gpt-4-32k': 'gpt-4-32k-0613',
    'gpt-4-turbo-preview': 'gpt-4-0125-preview',
    'gpt-4-turbo': 'gpt-4-turbo-2024-04-09',
    'gpt-4o': 'gpt-4o-2024-05-13',
    'gpt-4o-mini': 'gpt-4o-mini-2024-07-18',
};
/**
 * Incremental Models
 * @public
 * Model: [Input , Output, Train (If support)] ($/1K Tokens)
 */
Pricing.incrementalModels = {
    'gpt-4o-2024-05-13': [0.005, 0.015],
    'gpt-4o-mini-2024-07-18': [0.00015, 0.0006],
    'gpt-4-turbo-2024-04-09': [0.01, 0.03],
    'gpt-4-0314': [0.03, 0.06],
    'gpt-4-32k-0314': [0.06, 0.12],
    'gpt-4-0613': [0.03, 0.06, 0.0080],
    'gpt-4-32k-0613': [0.06, 0.12],
    'gpt-4-1106-preview': [0.01, 0.03],
    'gpt-4-0125-preview': [0.01, 0.03],
    'gpt-3.5-turbo-0301': [0.0015, 0.0020],
    'gpt-3.5-turbo-0613': [0.0015, 0.0020, 0.0080],
    'gpt-3.5-turbo-16k-0613': [0.0030, 0.0040],
    'gpt-3.5-turbo-1106': [0.0010, 0.0020, 0.0080],
    'gpt-3.5-turbo-0125': [0.0005, 0.0015], // 2024-01-25   (Fine-tuning is coming soon)
};
/**
 * Fine-tuning Models
 * @public
 * Model: [Input , Output, Train] ($/1K Tokens)
 */
Pricing.fineTuningModels = {
    'ft:gpt-3.5-turbo': [0.0030, 0.0060, 0.0080],
};

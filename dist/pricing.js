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
    'gpt-4o': 'gpt-4o-2024-08-06',
    'gpt-4o-mini': 'gpt-4o-mini-2024-07-18',
    'chatgpt-4o-latest': 'gpt-4o-2024-05-13',
    'o1-preview': 'o1-preview-2024-09-12',
    'o1-mini': 'o1-mini-2024-09-12',
    'o3-mini': 'o3-mini-2025-01-31',
};
/**
 * Incremental Models
 * @public
 * Model: [Input , Output, Train (If support)] ($/1K Tokens)
 */
Pricing.incrementalModels = {
    'o3-mini-2025-01-31': [0.0011, 0.0044], // 2025-01-31
    'o1': [0.015, 0.06], // 2024-12-18
    'o1-preview-2024-09-12': [0.015, 0.06], // 2024-09-12
    'o1-mini-2024-09-12': [0.0011, 0.0044], // 2024-09-12
    'gpt-4o-2024-05-13': [0.005, 0.015], // 2024-05-13
    'gpt-4o-2024-08-06': [0.0025, 0.010], // 2024-08-06
    'gpt-4o-2024-11-20': [0.0025, 0.010], // 2024-11-20
    'gpt-4o-mini-2024-07-18': [0.00015, 0.0006], // 2024-07-18
    'gpt-4-turbo-2024-04-09': [0.01, 0.03], // 2024-04-09
    'gpt-4-0314': [0.03, 0.06], // 2023-03-14
    'gpt-4-32k-0314': [0.06, 0.12], // 2023-03-14
    'gpt-4-0613': [0.03, 0.06, 0.0080], // 2023-06-13   (Fine-tuning experimental)
    'gpt-4-32k-0613': [0.06, 0.12], // 2023-06-13
    'gpt-4-1106-preview': [0.01, 0.03], // 2023-11-06
    'gpt-4-0125-preview': [0.01, 0.03], // 2024-01-25
    'gpt-3.5-turbo-0301': [0.0015, 0.0020], // 2023-03-01
    'gpt-3.5-turbo-0613': [0.0015, 0.0020, 0.0080], // 2023-06-13
    'gpt-3.5-turbo-16k-0613': [0.0030, 0.0040], // 2023-06-13
    'gpt-3.5-turbo-1106': [0.0010, 0.0020, 0.0080], // 2023-11-06   (Fine-tuning recommended)
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPTTokens = void 0;
const tiktoken_1 = require("@dqbd/tiktoken");
const decimal_js_1 = __importDefault(require("decimal.js"));
class GPTTokens {
    constructor(options) {
        // https://openai.com/pricing/
        // gpt-3.5-turbo
        // $0.002 / 1K tokens
        this.gpt3_5_turboTokenUnit = new decimal_js_1.default(0.002).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-4-8k
        // Prompt: $0.03 / 1K tokens
        //
        this.gpt4_8kPromptTokenUnit = new decimal_js_1.default(0.03).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-4-8k
        // Completion: $0.06 / 1K tokens
        // public readonly gpt4_8kCompletionTokenUnit = new Decimal(0.06).div(1000).toNumber()
        // https://openai.com/pricing/
        // gpt-4-32k
        // Prompt: $0.06 / 1K tokens
        this.gpt4_32kPromptTokenUnit = new decimal_js_1.default(0.06).div(1000).toNumber();
        // https://openai.com/pricing/
        // gpt-4-32k
        // Completion: $0.12 / 1K tokens
        // public readonly gpt4_32kCompletionTokenUnit = new Decimal(0.12).div(1000).toNumber()
        // The models supported
        this.supportModels = [
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0301',
            'gpt-4',
            'gpt-4-0314',
            'gpt-4-32k',
            'gpt-4-32k-0314',
        ];
        const { debug = false, model, messages, } = options;
        if (!this.supportModels.includes(model))
            throw new Error('Model not supported.');
        this.debug = debug;
        this.model = model;
        this.messages = messages;
    }
    // Used Tokens
    get usedTokens() {
        return this.num_tokens_from_messages(this.messages, this.model);
    }
    // Used USD
    get usedUSD() {
        if ([
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0301',
        ].includes(this.model))
            return new decimal_js_1.default(this.usedTokens)
                .mul(this.gpt3_5_turboTokenUnit)
                .toNumber();
        if ([
            'gpt-4',
            'gpt-4-0314',
        ].includes(this.model)) {
            // Does not distinguish between Prompt and Completion for the time being
            //
            // const promptUSD = new Decimal(this.promptUsedTokens)
            //     .mul(this.gpt4_8kPromptTokenUnit)
            // const completionUSD = new Decimal(this.completionUsedTokens)
            //     .mul(this.gpt4_8kCompletionTokenUnit)
            //
            // return promptUSD.add(completionUSD).toNumber()
            return new decimal_js_1.default(this.usedTokens).mul(new decimal_js_1.default(this.gpt4_8kPromptTokenUnit)).toNumber();
        }
        if ([
            'gpt-4-32k',
            'gpt-4-32k-0314',
        ].includes(this.model)) {
            // Does not distinguish between Prompt and Completion for the time being
            //
            // const promptUSD     = new Decimal(this.promptUsedTokens)
            //     .mul(this.gpt4_32kPromptTokenUnit)
            // const completionUSD = new Decimal(this.completionUsedTokens)
            //     .mul(this.gpt4_32kCompletionTokenUnit)
            //
            // return promptUSD.add(completionUSD).toNumber()
            return new decimal_js_1.default(this.usedTokens).mul(new decimal_js_1.default(this.gpt4_32kPromptTokenUnit)).toNumber();
        }
        throw new Error('Model not supported.');
    }
    // private get promptUsedTokens (): number {
    //     const messages = this.messages.filter(item => item.role !== 'assistant')
    //
    //     return this.num_tokens_from_messages(messages, this.model)
    // }
    //
    // private get completionUsedTokens (): number {
    //     const messages = this.messages.filter(item => item.role === 'assistant')
    //
    //     return this.num_tokens_from_messages(messages, this.model) - 3
    // }
    /**
     * Print a warning message.
     * @param message The message to print. Will be prefixed with "Warning: ".
     * @returns void
     */
    warning(message) {
        if (!this.debug)
            return;
        console.warn('Warning:', message);
    }
    /**
     * Return the number of tokens in a list of messages.
     * @param messages A list of messages.
     * @param model The model to use for encoding.
     * @returns The number of tokens in the messages.
     * @throws If the model is not supported.
     */
    num_tokens_from_messages(messages, model) {
        if (model === 'gpt-3.5-turbo') {
            this.warning('gpt-3.5-turbo may change over time. Returning num tokens assuming gpt-3.5-turbo-0301.');
            return this.num_tokens_from_messages(messages, 'gpt-3.5-turbo-0301');
        }
        if (model === 'gpt-4') {
            /**
             * https://help.openai.com/en/articles/7127966-what-is-the-difference-between-the-gpt-4-models
             *
             * Secondly, gpt-4 will refer to our most up-to-date model (and gpt-4-32k for the latest 32k-context model).
             * If you're interested in using a previous snapshot of the model, you can refer to the specific date in the model name, such as gpt-4-0314 or gpt-4-32k-0314.
             * The March 14th snapshot will be available until June 14th.
             */
            this.warning('gpt-4 may change over time. Returning num tokens assuming gpt-4-0314.');
            return this.num_tokens_from_messages(messages, 'gpt-4-0314');
        }
        if (model === 'gpt-4-32k') {
            /**
             * https://help.openai.com/en/articles/7127966-what-is-the-difference-between-the-gpt-4-models
             *
             * Secondly, gpt-4 will refer to our most up-to-date model (and gpt-4-32k for the latest 32k-context model).
             * If you're interested in using a previous snapshot of the model, you can refer to the specific date in the model name, such as gpt-4-0314 or gpt-4-32k-0314.
             * The March 14th snapshot will be available until June 14th.
             */
            this.warning('gpt-4-32k may change over time. Returning num tokens assuming gpt-4-32k-0314.');
            return this.num_tokens_from_messages(messages, 'gpt-4-32k-0314');
        }
        let encoding;
        let tokens_per_message;
        let tokens_per_name;
        let num_tokens = 0;
        try {
            encoding = (0, tiktoken_1.encoding_for_model)(model);
        }
        catch (e) {
            this.warning('model not found. Using cl100k_base encoding.');
            encoding = (0, tiktoken_1.get_encoding)('cl100k_base');
        }
        if (model === 'gpt-3.5-turbo-0301') {
            tokens_per_message = 4;
            tokens_per_name = -1;
        }
        if (['gpt-4-0314', 'gpt-4-32k-0314'].includes(model)) {
            tokens_per_message = 3;
            tokens_per_name = 1;
        }
        // Python 2 Typescript by gpt-4
        for (const message of messages) {
            num_tokens += tokens_per_message;
            for (const [key, value] of Object.entries(message)) {
                num_tokens += encoding.encode(value).length;
                if (key === 'name') {
                    num_tokens += tokens_per_name;
                }
            }
        }
        // Supplementary
        encoding.free();
        return num_tokens + 3;
    }
}
exports.GPTTokens = GPTTokens;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPTTokens = exports.getEncodingForModelCached = void 0;
const js_tiktoken_1 = require("js-tiktoken");
const openai_chat_tokens_1 = require("openai-chat-tokens");
const tokenPrice_1 = require("./tokenPrice");
let modelEncodingCache = {};
function getEncodingForModelCached(model) {
    if (!modelEncodingCache[model]) {
        try {
            modelEncodingCache[model] = (0, js_tiktoken_1.encodingForModel)(model);
        }
        catch (e) {
            console.error('Model not found. Using cl100k_base encoding.');
            modelEncodingCache[model] = (0, js_tiktoken_1.getEncoding)('cl100k_base');
        }
    }
    return modelEncodingCache[model];
}
exports.getEncodingForModelCached = getEncodingForModelCached;
class GPTTokens extends tokenPrice_1.TokenPrice {
    constructor(options) {
        super();
        const { model, fineTuneModel, messages, training, tools, debug = false, } = options;
        this.model = model !== null && model !== void 0 ? model : fineTuneModel === null || fineTuneModel === void 0 ? void 0 : fineTuneModel.split(':')[1];
        this.debug = debug;
        this.fineTuneModel = fineTuneModel;
        this.messages = messages;
        this.training = training;
        this.tools = tools;
        this.checkOptions();
    }
    checkOptions() {
        if (!GPTTokens.supportModels.includes(this.model))
            throw new Error(`Model ${this.model} is not supported`);
        if (!this.messages && !this.training && !this.tools)
            throw new Error('Must set on of messages | training | function');
        if (this.fineTuneModel && !this.fineTuneModel.startsWith('ft:gpt'))
            throw new Error(`Fine-tuning is not supported for ${this.fineTuneModel}`);
        if (this.training)
            this.trainPrice(this.model);
        if (this.tools && !this.messages)
            throw new Error('Function must set messages');
        if (GPTTokens.generalModelMapping[this.model])
            this.warning(`${this.model} may update over time. Returning num tokens assuming ${GPTTokens.generalModelMapping[this.model]}`);
    }
    static get supportModels() {
        return Object.keys(GPTTokens.modelsPrice);
    }
    // Used USD
    get usedUSD() {
        if (this.training)
            return this.trainPrice(this.model, this.usedTokens);
        if (this.tools)
            return this.inputPrice(this.model, this.usedTokens);
        return this.totalPrice(this.fineTuneModel
            ? `ft:${this.model}`
            : this.model, this.promptUsedTokens, this.completionUsedTokens);
    }
    // Used Tokens (total)
    get usedTokens() {
        if (this.training)
            return this.training.data
                .map(({ messages }) => new GPTTokens({
                model: this.model,
                messages,
            }).usedTokens + 2)
                .reduce((a, b) => a + b, 0) * this.training.epochs;
        if (this.tools)
            return (0, openai_chat_tokens_1.promptTokensEstimate)({
                messages: this.messages,
                functions: this.tools.map(item => item.function),
            });
        if (this.messages)
            return this.promptUsedTokens + this.completionUsedTokens;
        return 0;
    }
    // Used Tokens (prompt)
    get promptUsedTokens() {
        return GPTTokens.num_tokens_from_messages(this.promptMessages, this.model);
    }
    // Used Tokens (completion)
    get completionUsedTokens() {
        return this.completionMessage
            ? GPTTokens.contentUsedTokens(this.model, this.completionMessage)
            : 0;
    }
    static contentUsedTokens(model, content) {
        let encoding;
        encoding = getEncodingForModelCached(model);
        return encoding.encode(content).length;
    }
    get lastMessage() {
        return this.messages[this.messages.length - 1];
    }
    get promptMessages() {
        return this.lastMessage.role === 'assistant' ? this.messages.slice(0, -1) : this.messages;
    }
    get completionMessage() {
        return this.lastMessage.role === 'assistant'
            ? this.lastMessage.content
            : '';
    }
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
    static num_tokens_from_messages(messages, model) {
        let encoding;
        let tokens_per_message;
        let tokens_per_name;
        let num_tokens = 0;
        if (model === 'gpt-3.5-turbo-0301') {
            tokens_per_message = 4;
            tokens_per_name = -1;
        }
        else {
            tokens_per_message = 3;
            tokens_per_name = 1;
        }
        encoding = getEncodingForModelCached(model);
        // Python 2 Typescript by gpt-4
        for (const message of messages) {
            num_tokens += tokens_per_message;
            for (const [key, value] of Object.entries(message)) {
                if (typeof value !== 'string')
                    continue;
                num_tokens += encoding.encode(value).length;
                if (key === 'name') {
                    num_tokens += tokens_per_name;
                }
            }
        }
        // Supplementary
        // encoding.free()
        // every reply is primed with <|start|>assistant<|message|>
        return num_tokens + 3;
    }
}
exports.GPTTokens = GPTTokens;

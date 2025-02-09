"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPTTokens = exports.TokenPrice = void 0;
const js_tiktoken_1 = require("js-tiktoken");
const openai_chat_tokens_1 = require("openai-chat-tokens");
const tokenPrice_1 = require("./tokenPrice");
Object.defineProperty(exports, "TokenPrice", { enumerable: true, get: function () { return tokenPrice_1.TokenPrice; } });
class GPTTokens extends tokenPrice_1.TokenPrice {
    static getEncodingForModelCached(model) {
        const modelEncodingCache = GPTTokens.modelEncodingCache;
        if (!modelEncodingCache[model]) {
            try {
                let jsTikTokenSupportModel;
                switch (model) {
                    // Enabled when TiktokenModel support type is not included (like gpt-4o)
                    // case 'o1-preview':
                    // case 'o1-preview-2024-09-12':
                    // case 'o1-mini':
                    // case 'o1-mini-2024-09-12':
                    case 'o1':
                    case 'o3-mini-2025-01-31':
                    case 'o3-mini':
                    case 'gpt-4o-2024-11-20':
                        jsTikTokenSupportModel = 'gpt-4o';
                        break;
                    default:
                        jsTikTokenSupportModel = model;
                        break;
                }
                modelEncodingCache[model] = (0, js_tiktoken_1.encodingForModel)(jsTikTokenSupportModel);
            }
            catch (e) {
                console.error('Model not found. Using cl100k_base encoding.');
                modelEncodingCache[model] = (0, js_tiktoken_1.getEncoding)('cl100k_base');
            }
        }
        return modelEncodingCache[model];
    }
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
            throw new Error('Must set one of messages | training | function');
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
        encoding = GPTTokens.getEncodingForModelCached(model);
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
        encoding = GPTTokens.getEncodingForModelCached(model);
        // This is a port of the Python code from
        //
        // Python => Typescript by gpt-4
        //
        // https://notebooks.githubusercontent.com/view/ipynb?browser=edge&bypass_fastly=true&color_mode=dark&commit=d67c4181abe9dfd871d382930bb778b7014edc66&device=unknown_device&docs_host=https%3A%2F%2Fdocs.github.com&enc_url=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f6f70656e61692f6f70656e61692d636f6f6b626f6f6b2f643637633431383161626539646664383731643338323933306262373738623730313465646336362f6578616d706c65732f486f775f746f5f636f756e745f746f6b656e735f776974685f74696b746f6b656e2e6970796e62&logged_in=true&nwo=openai%2Fopenai-cookbook&path=examples%2FHow_to_count_tokens_with_tiktoken.ipynb&platform=mac&repository_id=468576060&repository_type=Repository&version=114#6d8d98eb-e018-4e1f-8c9e-19b152a97aaf
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
GPTTokens.modelEncodingCache = {};

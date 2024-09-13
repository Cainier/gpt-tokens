import { Tiktoken } from 'js-tiktoken';
import { TokenPrice } from './tokenPrice';
import type { supportModelType } from './pricing';
export type { supportModelType };
interface MessageItem {
    name?: string;
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export { TokenPrice };
export declare class GPTTokens extends TokenPrice {
    protected static modelEncodingCache: {
        [key in supportModelType]?: Tiktoken;
    };
    protected static getEncodingForModelCached(model: supportModelType): Tiktoken;
    constructor(options: {
        model?: supportModelType;
        fineTuneModel?: string;
        messages?: GPTTokens['messages'];
        training?: GPTTokens['training'];
        tools?: GPTTokens['tools'];
        debug?: boolean;
    });
    private checkOptions;
    static get supportModels(): supportModelType[];
    readonly debug: boolean;
    readonly model: supportModelType;
    readonly fineTuneModel: string | undefined;
    readonly messages?: MessageItem[];
    readonly training?: {
        data: {
            messages: MessageItem[];
        }[];
        epochs: number;
    };
    readonly tools?: {
        type: 'function';
        function: {
            name: string;
            description?: string;
            parameters: Record<string, unknown>;
        };
    }[];
    get usedUSD(): number;
    get usedTokens(): number;
    get promptUsedTokens(): number;
    get completionUsedTokens(): number;
    static contentUsedTokens(model: supportModelType, content: string): number;
    private get lastMessage();
    private get promptMessages();
    private get completionMessage();
    /**
     * Print a warning message.
     * @param message The message to print. Will be prefixed with "Warning: ".
     * @returns void
     */
    private warning;
    /**
     * Return the number of tokens in a list of messages.
     * @param messages A list of messages.
     * @param model The model to use for encoding.
     * @returns The number of tokens in the messages.
     * @throws If the model is not supported.
     */
    private static num_tokens_from_messages;
}

/**
 * This is a port of the Python code from
 *
 * https://notebooks.githubusercontent.com/view/ipynb?browser=edge&bypass_fastly=true&color_mode=dark&commit=d67c4181abe9dfd871d382930bb778b7014edc66&device=unknown_device&docs_host=https%3A%2F%2Fdocs.github.com&enc_url=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f6f70656e61692f6f70656e61692d636f6f6b626f6f6b2f643637633431383161626539646664383731643338323933306262373738623730313465646336362f6578616d706c65732f486f775f746f5f636f756e745f746f6b656e735f776974685f74696b746f6b656e2e6970796e62&logged_in=true&nwo=openai%2Fopenai-cookbook&path=examples%2FHow_to_count_tokens_with_tiktoken.ipynb&platform=mac&repository_id=468576060&repository_type=Repository&version=114#6d8d98eb-e018-4e1f-8c9e-19b152a97aaf
 */
export type supportModelType = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-0301' | 'gpt-4' | 'gpt-4-0314' | 'gpt-4-32k' | 'gpt-4-32k-0314';
type roleType = 'system' | 'user' | 'assistant';
interface MessageItem {
    name?: string;
    role: roleType;
    content: string;
}
interface Options {
    model: supportModelType;
    messages: MessageItem[];
    debug?: boolean;
}
export declare class GPTTokens {
    readonly model: supportModelType;
    readonly messages: MessageItem[];
    private readonly debug;
    readonly gpt3_5_turboTokenUnit: number;
    readonly gpt4_8kPromptTokenUnit: number;
    readonly gpt4_32kPromptTokenUnit: number;
    readonly supportModels: supportModelType[];
    constructor(options: Options);
    get usedTokens(): number;
    get usedUSD(): number;
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
    private num_tokens_from_messages;
}
export {};

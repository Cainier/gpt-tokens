import { Pricing } from './pricing';
export declare class TokenPrice extends Pricing {
    /**
     * models price
     * @private
     * https://openai.com/pricing
     *
     * Model: [Input , Output, Train] ($/1K Tokens)
     */
    protected static get modelsPrice(): {
        [model: string]: [number, number, number?];
    };
    get inputPrice(): (model: string, tokens?: number) => number;
    get outputPrice(): (model: string, tokens?: number) => number;
    get totalPrice(): (model: string, inputTokens: number, outputTokens: number) => number;
    get trainPrice(): (model: string, tokens?: number) => number;
    private get modelFormat();
    private get calcPrice();
}

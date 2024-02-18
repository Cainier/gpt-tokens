/**
 * Pricing
 * @class
 * https://openai.com/pricing
 */
export declare class Pricing {
    /**
     * General Model Mapping
     * @public
     * General Model => Incremental Model
     */
    static readonly generalModelMapping: {
        [key: string]: string;
    };
    /**
     * Incremental Models
     * @public
     * Model: [Input , Output, Train (If support)] ($/1K Tokens)
     */
    static readonly incrementalModels: {
        [model: string]: [number, number, number?];
    };
    /**
     * Fine-tuning Models
     * @public
     * Model: [Input , Output, Train] ($/1K Tokens)
     */
    static readonly fineTuningModels: {
        [model: string]: [number, number, number];
    };
}

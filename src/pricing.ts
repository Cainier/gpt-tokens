/**
 * Pricing
 * @class
 * https://openai.com/pricing
 */
export class Pricing {
    /**
     * General Model Mapping
     * @public
     * General Model => Incremental Model
     */
    public static readonly generalModelMapping: {
        [key: string]: string
    } = {
        'gpt-3.5-turbo'      : 'gpt-3.5-turbo-0125',
        'gpt-3.5-turbo-16k'  : 'gpt-3.5-turbo-0125',
        'gpt-4'              : 'gpt-4-0613',
        'gpt-4-32k'          : 'gpt-4-32k-0613',
        'gpt-4-turbo-preview': 'gpt-4-0125-preview',
    }

    /**
     * Incremental Models
     * @public
     * Model: [Input , Output, Train (If support)] ($/1K Tokens)
     */
    public static readonly incrementalModels: {
        [model: string]: [number, number, number?]
    } = {
        'gpt-4-0314'               : [0.03, 0.06],                  // 2023-03-14
        'gpt-4-32k-0314'           : [0.06, 0.12],                  // 2023-03-14
        'gpt-4-0613'               : [0.03, 0.06, 0.0080],          // 2023-06-13   (Fine-tuning experimental)
        'gpt-4-32k-0613'           : [0.06, 0.12],                  // 2023-06-13
        'gpt-4-1106-preview'       : [0.01, 0.03],                  // 2023-11-06
        'gpt-4-0125-preview'       : [0.01, 0.03],                  // 2024-01-25
        'gpt-3.5-turbo-0301'       : [0.0015, 0.0020],              // 2023-03-01
        'gpt-3.5-turbo-0613'       : [0.0015, 0.0020, 0.0080],      // 2023-06-13
        'gpt-3.5-turbo-16k-0613'   : [0.0030, 0.0040],              // 2023-06-13
        'gpt-3.5-turbo-1106'       : [0.0010, 0.0020, 0.0080],      // 2023-11-06   (Fine-tuning recommended)
        'gpt-3.5-turbo-0125'       : [0.0005, 0.0015],              // 2024-01-25   (Fine-tuning is coming soon)
    }

    /**
     * Fine-tuning Models
     * @public
     * Model: [Input , Output, Train] ($/1K Tokens)
     */
    public static readonly fineTuningModels: {
        [model: string]: [number, number, number]
    } = {
        'ft:gpt-3.5-turbo': [0.0030, 0.0060, 0.0080],
    }
}

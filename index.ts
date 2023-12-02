import { encodingForModel, getEncoding, Tiktoken } from 'js-tiktoken'
import Decimal                                     from 'decimal.js'
import OpenAI                                      from 'openai'
import { promptTokensEstimate }                    from 'openai-chat-tokens'

let modelEncodingCache: { [key in supportModelType]?: Tiktoken } = {}

export function getEncodingForModelCached (model: supportModelType): Tiktoken {
    if (!modelEncodingCache[model]) {
        try {
            if (['gpt-3.5-turbo-1106'].includes(model)) model = 'gpt-3.5-turbo'
            if (['gpt-4-1106-preview'].includes(model)) model = 'gpt-4'

            modelEncodingCache[model] = encodingForModel(model as Parameters<typeof encodingForModel>[0])
        } catch (e) {
            console.error('Model not found. Using cl100k_base encoding.')
            modelEncodingCache[model] = getEncoding('cl100k_base')
        }
    }

    return modelEncodingCache[model]!
}

/**
 * This is a port of the Python code from
 *
 * https://notebooks.githubusercontent.com/view/ipynb?browser=edge&bypass_fastly=true&color_mode=dark&commit=d67c4181abe9dfd871d382930bb778b7014edc66&device=unknown_device&docs_host=https%3A%2F%2Fdocs.github.com&enc_url=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f6f70656e61692f6f70656e61692d636f6f6b626f6f6b2f643637633431383161626539646664383731643338323933306262373738623730313465646336362f6578616d706c65732f486f775f746f5f636f756e745f746f6b656e735f776974685f74696b746f6b656e2e6970796e62&logged_in=true&nwo=openai%2Fopenai-cookbook&path=examples%2FHow_to_count_tokens_with_tiktoken.ipynb&platform=mac&repository_id=468576060&repository_type=Repository&version=114#6d8d98eb-e018-4e1f-8c9e-19b152a97aaf
 */

export type supportModelType =
    | 'gpt-3.5-turbo'
    | 'gpt-3.5-turbo-0301'
    | 'gpt-3.5-turbo-0613'
    | 'gpt-3.5-turbo-1106'
    | 'gpt-3.5-turbo-16k'
    | 'gpt-3.5-turbo-16k-0613'
    | 'gpt-4'
    | 'gpt-4-0314'
    | 'gpt-4-0613'
    | 'gpt-4-32k'
    | 'gpt-4-32k-0314'
    | 'gpt-4-32k-0613'
    | 'gpt-4-1106-preview'

interface MessageItem {
    name?: string
    role: 'system' | 'user' | 'assistant'
    content: string
}

export class GPTTokens {
    constructor (options: {
        model?: supportModelType
        fineTuneModel?: string
        messages?: GPTTokens['messages']
        training?: GPTTokens['training']
        tools?: GPTTokens['tools']
        debug?: boolean
    }) {
        const {
                  model,
                  fineTuneModel,
                  messages,
                  training,
                  tools,
                  debug = false,
              } = options

        this.model         = model || fineTuneModel?.split(':')[1] as supportModelType
        this.debug         = debug
        this.fineTuneModel = fineTuneModel
        this.messages      = messages
        this.training      = training
        this.tools         = tools

        this.checkOptions()
    }

    private checkOptions () {
        if (!GPTTokens.supportModels.includes(this.model))
            throw new Error(`Model ${this.model} is not supported`)

        if (!this.messages && !this.training && !this.tools)
            throw new Error('Must set on of messages | training | function')

        if (this.fineTuneModel && !this.fineTuneModel.startsWith('ft:gpt'))
            throw new Error(`Fine-tuning is not supported for ${this.fineTuneModel}`)

        // https://platform.openai.com/docs/guides/fine-tuning
        if (![
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0613',
            'gpt-3.5-turbo-1106',
            'gpt-4-0613',
        ].includes(this.model) && this.training)
            throw new Error(`Fine-tuning is not supported for model ${this.model}`)

        // https://platform.openai.com/docs/guides/function-calling
        if (![
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0613',
            'gpt-3.5-turbo-1106',
            'gpt-4',
            'gpt-4-0613',
            'gpt-4-1106-preview',
        ].includes(this.model) && this.tools)
            throw new Error(`Function is not supported for model ${this.model}`)

        if (this.tools && !this.messages)
            throw new Error('Function must set messages')

        if (this.model === 'gpt-3.5-turbo')
            this.warning(`${this.model} may update over time. Returning num tokens assuming gpt-3.5-turbo-1106`)

        if (this.model === 'gpt-4')
            this.warning(`${this.model} may update over time. Returning num tokens assuming gpt-4-0613`)

        if (this.model === 'gpt-4-32k')
            this.warning(`${this.model} may update over time. Returning num tokens assuming gpt-4-32k-0613`)

        // old model

        if ([
            'gpt-3.5-turbo-0301',
            'gpt-3.5-turbo-0613',
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-16k-0613',
            'gpt-4-0314',
            'gpt-4-32k-0314',
        ].includes(this.model)) this.warning(`${this.model} is old model. Please migrating to replacements: https://platform.openai.com/docs/deprecations/`)
    }

    public static readonly supportModels: supportModelType [] = [
        'gpt-3.5-turbo-0301',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-0613',
        'gpt-3.5-turbo-16k',
        'gpt-3.5-turbo-16k-0613',
        'gpt-3.5-turbo-1106',
        'gpt-4',
        'gpt-4-0314',
        'gpt-4-0613',
        'gpt-4-32k',
        'gpt-4-32k-0314',
        'gpt-4-32k-0613',
        'gpt-4-1106-preview',
    ]

    public readonly debug
    public readonly model
    public readonly fineTuneModel
    public readonly messages?: MessageItem []
    public readonly training?: {
        data: {
            messages: MessageItem []
        } []
        epochs: number
    }
    public readonly tools?: {
        type: 'function'
        function: {
            name: string
            description?: string
            parameters: Record<string, unknown>
        }
    } []

    // https://openai.com/pricing/
    // gpt-3.5-turbo 4K context
    // $0.0015 / 1K tokens
    public readonly gpt3_5_turboPromptTokenUnit = new Decimal(0.0015).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-3.5-turbo 4K context
    // $0.002 / 1K tokens
    public readonly gpt3_5_turboCompletionTokenUnit = new Decimal(0.002).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-3.5-turbo-16k
    // Prompt: $0.003 / 1K tokens
    public readonly gpt3_5_turbo_16kPromptTokenUnit = new Decimal(0.003).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-3.5-turbo-16k
    // Prompt: $0.004 / 1K tokens
    public readonly gpt3_5_turbo_16kCompletionTokenUnit = new Decimal(0.004).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-3.5-turbo-16k
    // Prompt: $0.001 / 1K tokens
    public readonly gpt3_5_turbo_1106PromptTokenUnit = new Decimal(0.001).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-3.5-turbo-16k
    // Prompt: $0.002 / 1K tokens
    public readonly gpt3_5_turbo_1106CompletionTokenUnit = new Decimal(0.002).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-4-8k
    // Prompt: $0.03 / 1K tokens
    public readonly gpt4_8kPromptTokenUnit = new Decimal(0.03).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-4-8k
    // Completion: $0.06 / 1K tokens
    public readonly gpt4_8kCompletionTokenUnit = new Decimal(0.06).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-4-32k
    // Prompt: $0.06 / 1K tokens
    public readonly gpt4_32kPromptTokenUnit = new Decimal(0.06).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-4-32k
    // Completion: $0.12 / 1K tokens
    public readonly gpt4_32kCompletionTokenUnit = new Decimal(0.12).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-4-1106-preview
    // Prompt: $0.01 / 1K tokens
    public readonly gpt4_turbo_previewPromptTokenUnit = new Decimal(0.01).div(1000).toNumber()

    // https://openai.com/pricing/
    // gpt-4-1106-preview
    // Completion: $0.03 / 1K tokens
    public readonly gpt4_turbo_previewCompletionTokenUnit = new Decimal(0.03).div(1000).toNumber()

    // https://openai.com/pricing/
    // Fine-tuning models gpt-3.5-turbo
    // Training: $0.008 / 1K tokens
    public readonly gpt3_5_turbo_fine_tuneTrainingTokenUnit = new Decimal(0.008).div(1000).toNumber()

    // https://openai.com/pricing/
    // Fine-tuning models gpt-3.5-turbo
    // Prompt: $0.003 / 1K tokens
    public readonly gpt3_5_turbo_fine_tunePromptTokenUnit = new Decimal(0.003).div(1000).toNumber()

    // https://openai.com/pricing/
    // Fine-tuning models gpt-3.5-turbo
    // Completion: $0.006 / 1K tokens
    public readonly gpt3_5_turbo_fine_tuneCompletionTokenUnit = new Decimal(0.006).div(1000).toNumber()

    // Used USD
    public get usedUSD () {
        if (this.training) return this.trainingUsedUSD()
        if (this.tools) return this.functionUsedUSD()
        if (this.fineTuneModel) return this.fineTuneUsedUSD()

        return this.basicUsedTokens()
    }

    private trainingUsedUSD () {
        return new Decimal(this.usedTokens).mul(this.gpt3_5_turbo_fine_tuneTrainingTokenUnit).toNumber()
    }

    private functionUsedUSD () {
        if ([
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0613',
        ].includes(this.model))
            return new Decimal(this.usedTokens)
                .mul(this.gpt3_5_turboPromptTokenUnit).toNumber()

        if ([
            'gpt-3.5-turbo-1106',
        ].includes(this.model))
            return new Decimal(this.usedTokens)
                .mul(this.gpt3_5_turbo_1106PromptTokenUnit).toNumber()

        if ([
            'gpt-4',
            'gpt-4-0613',
        ].includes(this.model)) return new Decimal(this.usedTokens)
            .mul(this.gpt4_8kPromptTokenUnit).toNumber()

        if ([
            'gpt-4-1106-preview',
        ].includes(this.model)) return new Decimal(this.usedTokens)
            .mul(this.gpt4_turbo_previewPromptTokenUnit).toNumber()

        throw new Error(`Model ${this.model} is not supported`)
    }

    private fineTuneUsedUSD () {
        const promptUSD     = new Decimal(this.promptUsedTokens)
            .mul(this.gpt3_5_turbo_fine_tunePromptTokenUnit)
        const completionUSD = new Decimal(this.completionUsedTokens)
            .mul(this.gpt3_5_turbo_fine_tuneCompletionTokenUnit)

        return promptUSD.add(completionUSD).toNumber()
    }

    private basicUsedTokens () {
        if ([
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0301',
            'gpt-3.5-turbo-0613',
        ].includes(this.model)) {
            const promptUSD     = new Decimal(this.promptUsedTokens)
                .mul(this.gpt3_5_turboPromptTokenUnit)
            const completionUSD = new Decimal(this.completionUsedTokens)
                .mul(this.gpt3_5_turboCompletionTokenUnit)

            return promptUSD.add(completionUSD).toNumber()
        }

        if ([
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-16k-0613',
        ].includes(this.model)) {
            const promptUSD     = new Decimal(this.promptUsedTokens)
                .mul(this.gpt3_5_turbo_16kPromptTokenUnit)
            const completionUSD = new Decimal(this.completionUsedTokens)
                .mul(this.gpt3_5_turbo_16kCompletionTokenUnit)

            return promptUSD.add(completionUSD).toNumber()
        }

        if ([
            'gpt-3.5-turbo-1106',
        ].includes(this.model)) {
            const promptUSD     = new Decimal(this.promptUsedTokens)
                .mul(this.gpt3_5_turbo_1106PromptTokenUnit)
            const completionUSD = new Decimal(this.completionUsedTokens)
                .mul(this.gpt3_5_turbo_1106CompletionTokenUnit)

            return promptUSD.add(completionUSD).toNumber()
        }

        if ([
            'gpt-4',
            'gpt-4-0314',
            'gpt-4-0613',
        ].includes(this.model)) {
            const promptUSD     = new Decimal(this.promptUsedTokens)
                .mul(this.gpt4_8kPromptTokenUnit)
            const completionUSD = new Decimal(this.completionUsedTokens)
                .mul(this.gpt4_8kCompletionTokenUnit)

            return promptUSD.add(completionUSD).toNumber()
        }

        if ([
            'gpt-4-32k',
            'gpt-4-32k-0314',
            'gpt-4-32k-0613',
        ].includes(this.model)) {
            const promptUSD     = new Decimal(this.promptUsedTokens)
                .mul(this.gpt4_32kPromptTokenUnit)
            const completionUSD = new Decimal(this.completionUsedTokens)
                .mul(this.gpt4_32kCompletionTokenUnit)

            return promptUSD.add(completionUSD).toNumber()
        }

        if (this.model === 'gpt-4-1106-preview') {
            const promptUSD     = new Decimal(this.promptUsedTokens)
                .mul(this.gpt4_turbo_previewPromptTokenUnit)
            const completionUSD = new Decimal(this.completionUsedTokens)
                .mul(this.gpt4_turbo_previewCompletionTokenUnit)

            return promptUSD.add(completionUSD).toNumber()
        }

        throw new Error(`Model ${this.model} is not supported`)
    }

    // Used Tokens (total)
    public get usedTokens (): number {
        if (this.training) return this.training.data
            .map(({ messages }) => new GPTTokens({
                model: this.model,
                messages,
            }).usedTokens + 2)
            .reduce((a, b) => a + b, 0) * this.training.epochs

        if (this.tools) return promptTokensEstimate({
            messages : this.messages!,
            functions: this.tools.map(item => item.function),
        })

        if (this.messages) return this.promptUsedTokens + this.completionUsedTokens

        return 0
    }

    // Used Tokens (prompt)
    public get promptUsedTokens () {
        return GPTTokens.num_tokens_from_messages(this.promptMessages, this.model)
    }

    // Used Tokens (completion)
    public get completionUsedTokens () {
        return this.completionMessage
            ? GPTTokens.contentUsedTokens(this.model, this.completionMessage)
            : 0
    }

    public static contentUsedTokens (model: supportModelType, content: string) {
        let encoding!: Tiktoken

        encoding = getEncodingForModelCached(model)

        return encoding.encode(content).length
    }

    private get lastMessage () {
        return this.messages![this.messages!.length - 1]
    }

    private get promptMessages () {
        return this.lastMessage.role === 'assistant' ? this.messages!.slice(0, -1) : this.messages!
    }

    private get completionMessage () {
        return this.lastMessage.role === 'assistant'
            ? this.lastMessage.content
            : ''
    }

    /**
     * Print a warning message.
     * @param message The message to print. Will be prefixed with "Warning: ".
     * @returns void
     */
    private warning (message: string) {
        if (!this.debug) return
        console.warn('Warning:', message)
    }

    /**
     * Return the number of tokens in a list of messages.
     * @param messages A list of messages.
     * @param model The model to use for encoding.
     * @returns The number of tokens in the messages.
     * @throws If the model is not supported.
     */
    private static num_tokens_from_messages (messages: MessageItem [], model: supportModelType) {
        let encoding!: Tiktoken
        let tokens_per_message!: number
        let tokens_per_name !: number
        let num_tokens = 0

        if ([
            'gpt-3.5-turbo-0301',
        ].includes(model)) {
            tokens_per_message = 4
            tokens_per_name    = -1
        }

        if ([
            'gpt-3.5-turbo',
            'gpt-3.5-turbo-0613',
            'gpt-3.5-turbo-1106',
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-16k-0613',
            'gpt-4',
            'gpt-4-0314',
            'gpt-4-0613',
            'gpt-4-32k',
            'gpt-4-32k-0314',
            'gpt-4-32k-0613',
            'gpt-4-1106-preview',
        ].includes(model)) {
            tokens_per_message = 3
            tokens_per_name    = 1
        }

        encoding = getEncodingForModelCached(model)

        // Python 2 Typescript by gpt-4
        for (const message of messages) {
            num_tokens += tokens_per_message

            for (const [key, value] of Object.entries(message)) {
                if (typeof value !== 'string') continue

                num_tokens += encoding.encode(value as string).length
                if (key === 'name') {
                    num_tokens += tokens_per_name
                }
            }
        }

        // Supplementary
        // encoding.free()

        // every reply is primed with <|start|>assistant<|message|>
        return num_tokens + 3
    }
}

export async function testGPTTokens (openai: OpenAI, prompt: string) {
    const messages: MessageItem [] = [
        { role: 'user', content: prompt },
    ]
    const { length: modelsNum }    = GPTTokens.supportModels

    for (let i = 0; i < modelsNum; i += 1) {
        const model = GPTTokens.supportModels[i]

        console.info(`[${i + 1}/${modelsNum}]: Testing ${model}...`)

        let ignoreModel = false

        const chatCompletion = await openai.chat.completions.create({
            model,
            messages,
        })
            .catch(err => {
                ignoreModel = true

                console.info(`Ignore model ${model}:`, err.message)
            })

        const openaiUsage = chatCompletion?.usage

        const gptTokens = new GPTTokens({
            model,
            messages: [
                ...messages,
                ...[chatCompletion?.choices[0].message],
            ] as MessageItem [],
        })

        if (ignoreModel) continue

        if (!openaiUsage) {
            console.error(`Test ${model} failed (openai return usage is null)`)
            continue
        }

        if (gptTokens.promptUsedTokens !== openaiUsage.prompt_tokens)
            throw new Error(`Test ${model} promptUsedTokens failed (openai: ${openaiUsage.prompt_tokens}/ gpt-tokens: ${gptTokens.promptUsedTokens})`)

        if (gptTokens.completionUsedTokens !== openaiUsage.completion_tokens)
            throw new Error(`Test ${model} completionUsedTokens failed (openai: ${openaiUsage.completion_tokens}/ gpt-tokens: ${gptTokens.completionUsedTokens})`)

        if (gptTokens.usedTokens !== openaiUsage?.total_tokens)
            throw new Error(`Test ${model} usedTokens failed (openai: ${openaiUsage?.total_tokens}/ gpt-tokens: ${gptTokens.usedTokens})`)

        console.info('Pass!')
    }

    console.info('Test success!')
}

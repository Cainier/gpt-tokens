import type { TiktokenModel }                      from 'js-tiktoken'
import { encodingForModel, getEncoding, Tiktoken } from 'js-tiktoken'
import { promptTokensEstimate }                    from 'openai-chat-tokens'
import { TokenPrice }                              from './tokenPrice'
import type { supportModelType }                   from './pricing'

export type { supportModelType }

interface MessageItem {
    name?: string
    role: 'system' | 'user' | 'assistant'
    content: string
}

export { TokenPrice }

export class GPTTokens extends TokenPrice {
    protected static modelEncodingCache: { [key in supportModelType]?: Tiktoken } = {}

    protected static getEncodingForModelCached (model: supportModelType): Tiktoken {
        const modelEncodingCache = GPTTokens.modelEncodingCache
        if (!modelEncodingCache[model]) {
            try {
                let jsTikTokenSupportModel: TiktokenModel

                switch (model) {
                    // Enabled when TiktokenModel support type is not included (like gpt-4o)
                    // case 'gpt-4o-mini':
                    // case 'gpt-4o-mini-2024-07-18':
                    //     jsTikTokenSupportModel = 'gpt-4o'
                    //     break

                    default:
                        jsTikTokenSupportModel = model
                        break
                }

                modelEncodingCache[model] = encodingForModel(jsTikTokenSupportModel)
            } catch (e) {
                console.error('Model not found. Using cl100k_base encoding.')

                modelEncodingCache[model] = getEncoding('cl100k_base')
            }
        }

        return modelEncodingCache[model]!
    }

    constructor (options: {
        model?: supportModelType
        fineTuneModel?: string
        messages?: GPTTokens['messages']
        training?: GPTTokens['training']
        tools?: GPTTokens['tools']
        debug?: boolean
    }) {
        super()

        const {
                  model,
                  fineTuneModel,
                  messages,
                  training,
                  tools,
                  debug = false,
              } = options

        this.model         = model ?? fineTuneModel?.split(':')[1] as supportModelType
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
            throw new Error('Must set one of messages | training | function')

        if (this.fineTuneModel && !this.fineTuneModel.startsWith('ft:gpt'))
            throw new Error(`Fine-tuning is not supported for ${this.fineTuneModel}`)

        if (this.training) this.trainPrice(this.model)

        if (this.tools && !this.messages)
            throw new Error('Function must set messages')

        if (GPTTokens.generalModelMapping[this.model])
            this.warning(`${this.model} may update over time. Returning num tokens assuming ${GPTTokens.generalModelMapping[this.model]}`)
    }

    public static get supportModels () {
        return Object.keys(GPTTokens.modelsPrice) as supportModelType []
    }

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

    // Used USD
    public get usedUSD () {
        if (this.training) return this.trainPrice(this.model, this.usedTokens)
        if (this.tools) return this.inputPrice(this.model, this.usedTokens)

        return this.totalPrice(this.fineTuneModel
                ? `ft:${this.model}`
                : this.model,
            this.promptUsedTokens,
            this.completionUsedTokens)
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

        encoding = GPTTokens.getEncodingForModelCached(model)

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

        if (model === 'gpt-3.5-turbo-0301') {
            tokens_per_message = 4
            tokens_per_name    = -1
        } else {
            tokens_per_message = 3
            tokens_per_name    = 1
        }

        encoding = GPTTokens.getEncodingForModelCached(model)

        // This is a port of the Python code from
        //
        // Python => Typescript by gpt-4
        //
        // https://notebooks.githubusercontent.com/view/ipynb?browser=edge&bypass_fastly=true&color_mode=dark&commit=d67c4181abe9dfd871d382930bb778b7014edc66&device=unknown_device&docs_host=https%3A%2F%2Fdocs.github.com&enc_url=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f6f70656e61692f6f70656e61692d636f6f6b626f6f6b2f643637633431383161626539646664383731643338323933306262373738623730313465646336362f6578616d706c65732f486f775f746f5f636f756e745f746f6b656e735f776974685f74696b746f6b656e2e6970796e62&logged_in=true&nwo=openai%2Fopenai-cookbook&path=examples%2FHow_to_count_tokens_with_tiktoken.ipynb&platform=mac&repository_id=468576060&repository_type=Repository&version=114#6d8d98eb-e018-4e1f-8c9e-19b152a97aaf

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

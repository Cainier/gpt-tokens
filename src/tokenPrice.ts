import { Pricing } from './pricing'
import Decimal     from 'decimal.js'

export class TokenPrice extends Pricing {
    /**
     * models price
     * @private
     * https://openai.com/pricing
     *
     * Model: [Input , Output, Train] ($/1K Tokens)
     */
    protected static get modelsPrice (): {
        [model: string]: [number, number, number?]
    } {
        const generalModels: typeof TokenPrice.modelsPrice = {}

        Object.entries(TokenPrice.generalModelMapping).forEach(([generalModel, incrementalModel]) => {
            generalModels[generalModel] = TokenPrice.incrementalModels[incrementalModel]
        })

        return {
            ...generalModels,
            ...TokenPrice.incrementalModels,
            ...TokenPrice.fineTuningModels,
        }
    }

    public get inputPrice () {
        return (model: string, tokens = 1000) => this.calcPrice(TokenPrice.modelsPrice[this.modelFormat(model)][0], tokens)
    }

    public get outputPrice () {
        return (model: string, tokens = 1000) => this.calcPrice(TokenPrice.modelsPrice[this.modelFormat(model)][1], tokens)
    }

    public get totalPrice () {
        return (model: string, inputTokens: number, outputTokens: number) => {
            const inputPrice  = this.inputPrice(model, inputTokens)
            const outputPrice = this.outputPrice(model, outputTokens)

            return new Decimal(inputPrice).add(outputPrice).toNumber()
        }
    }

    public get trainPrice () {
        return (model: string, tokens = 1000) => {
            const price = TokenPrice.modelsPrice[this.modelFormat(model)][2]

            if (price === undefined) throw new Error(`Model ${model} does not support training`)

            return this.calcPrice(price, tokens)
        }
    }

    private get modelFormat () {
        return (model: string) => {
            return model.startsWith('ft:')
                ? Object.entries(TokenPrice.modelsPrice)
                    .find(([ftModel]) => model.includes(ftModel))![0]
                : model
        }
    }

    private get calcPrice () {
        return (price: number, tokens: number) => new Decimal(price)
            .mul(tokens)
            .div(1000)
            .toNumber()
    }
}

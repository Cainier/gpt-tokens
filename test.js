const fs                           = require('fs')
const OpenAI                       = require('openai')
const { GPTTokens, testGPTTokens } = require('./index')

const [apiKey = process.env.OPENAI_API_KEY] = process.argv.slice(2)

if (!apiKey) {
    console.error('No API key provided. Ignoring test.')
    process.exit(0)
}

const openai = new OpenAI({ apiKey })

async function testBasic(prompt) {
    console.info('Testing GPT...')

    await testGPTTokens(openai, prompt)
}

function testTraining(filepath) {
    console.info('Testing Create a fine-tuned model...')

    const openaiUsedTokens = 4445

    const gptTokens = new GPTTokens({
        model   : 'gpt-3.5-turbo-1106',
        training: {
            data  : fs
                .readFileSync(filepath, 'utf-8')
                .split('\n')
                .filter(Boolean)
                .map(row => JSON.parse(row)),
            epochs: 7,
        },
    })

    if (gptTokens.usedTokens !== openaiUsedTokens) throw new Error(`Test training usedTokens failed (openai: ${openaiUsedTokens}/ gpt-tokens: ${gptTokens.usedTokens})`)

    console.info('Pass!')
}

function testPerformance(messages) {
    console.info('Testing performance...')
    console.info('Messages:', JSON.stringify(messages))

    for (let i = 0; i < 10; i++) {
        console.time('GPTTokens')

        const usageInfo = new GPTTokens({
            plus : false,
            model: 'gpt-3.5-turbo-0613',
            messages,
        })

        usageInfo.usedTokens
        usageInfo.promptUsedTokens
        usageInfo.completionUsedTokens
        usageInfo.usedUSD

        console.timeEnd('GPTTokens')
    }
}

async function testFunctionCalling() {
    console.info('Testing function calling...')

    await Promise.all([
        functionCalling1(),
        functionCalling2(),
    ])

    console.info('Pass!')

    async function functionCalling1() {
        // https://platform.openai.com/docs/guides/function-calling

        // Example dummy function hard coded to return the same weather
        // In production, this could be your backend API or an external API
        function getCurrentWeather(location, unit = 'fahrenheit') {
            if (location.toLowerCase().includes('tokyo')) {
                return JSON.stringify({ location: 'Tokyo', temperature: '10', unit: 'celsius' })
            } else if (location.toLowerCase().includes('san francisco')) {
                return JSON.stringify({ location: 'San Francisco', temperature: '72', unit: 'fahrenheit' })
            } else if (location.toLowerCase().includes('paris')) {
                return JSON.stringify({ location: 'Paris', temperature: '22', unit: 'fahrenheit' })
            } else {
                return JSON.stringify({ location, temperature: 'unknown' })
            }
        }

        async function runConversation() {
            // Step 1: send the conversation and available functions to the model
            const model    = 'gpt-3.5-turbo-1106'
            const messages = [
                { role: 'user', content: 'What\'s the weather like in San Francisco and Paris?' },
            ]
            const tools    = [
                {
                    type    : 'function',
                    function: {
                        name       : 'get_current_weather',
                        description: 'Get the current weather in a given location',
                        parameters : {
                            type      : 'object',
                            properties: {
                                location: {
                                    type       : 'string',
                                    description: 'The city and state, e.g. San Francisco, CA',
                                },
                                unit    : {
                                    type: 'string',
                                    enum: ['celsius', 'fahrenheit'],
                                },
                            },
                            required  : ['location'],
                        },
                    },
                },
            ]

            const response = await openai.chat.completions.create({
                model,
                messages,
                tools,
                tool_choice: 'auto', // auto is default, but we'll be explicit
            })

            const { usage: openaiUsage } = response

            const gptTokens = new GPTTokens({
                model,
                messages,
                tools,
            })

            if (gptTokens.usedTokens !== openaiUsage.prompt_tokens)
                throw new Error(`Test function calling promptUsedTokens failed (openai: ${openaiUsage.prompt_tokens}/ gpt-tokens: ${gptTokens.usedTokens})`)

            const responseMessage = response.choices[0].message

            // Step 2: check if the model wanted to call a function
            const toolCalls = responseMessage.tool_calls

            if (responseMessage.tool_calls) {
                // Step 3: call the function
                // Note: the JSON response may not always be valid; be sure to handle errors

                const availableFunctions = {
                    get_current_weather: getCurrentWeather,
                } // only one function in this example, but you can have multiple

                messages.push(responseMessage) // extend conversation with assistant's reply

                for (const toolCall of toolCalls) {
                    const functionName     = toolCall.function.name
                    const functionToCall   = availableFunctions[functionName]
                    const functionArgs     = JSON.parse(toolCall.function.arguments)
                    const functionResponse = functionToCall(
                        functionArgs.location,
                        functionArgs.unit,
                    )

                    messages.push({
                        tool_call_id: toolCall.id,
                        role        : 'tool',
                        name        : functionName,
                        content     : functionResponse,
                    }) // extend conversation with function response
                }

                const secondResponse = await openai.chat.completions.create({
                    model   : 'gpt-3.5-turbo-1106',
                    messages: messages,
                }) // get a new response from the model where it can see the function response

                return secondResponse.choices
            }
        }

        await runConversation()
    }

    async function functionCalling2() {
        // https://platform.openai.com/docs/guides/function-calling

        // Example dummy function hard coded to return the same weather
        // In production, this could be your backend API or an external API
        function getProductPrice(store, product) {
            return JSON.stringify({
                store,
                product,
                price: (Math.random() * 1000).toFixed(0),
                unit : '$',
            })
        }

        async function runConversation() {
            // Step 1: send the conversation and available functions to the model
            const model    = 'gpt-3.5-turbo-1106'
            const messages = [
                { role: 'user', content: 'ps5 price in all stores' },
            ]

            const tools = [
                {
                    type    : 'function',
                    function: {
                        name       : 'get_product_price',
                        description: 'Get the price of an item in a specified store',
                        parameters : {
                            type      : 'object',
                            properties: {
                                store  : {
                                    type       : 'string',
                                    description: 'The store name',
                                    enum       : ['Amazon', 'Ebay', 'TaoBao'],
                                },
                                product: {
                                    type       : 'string',
                                    description: 'The product name e.g. MacbookPro',
                                },
                            },
                            required  : ['product'],
                        },
                    },
                },
            ]

            const response = await openai.chat.completions.create({
                model,
                messages,
                tools,
                tool_choice: 'auto', // auto is default, but we'll be explicit
            })

            const { usage: openaiUsage } = response

            const gptTokens = new GPTTokens({
                model,
                messages,
                tools,
            })

            if (gptTokens.usedTokens !== openaiUsage.prompt_tokens)
                throw new Error(`Test function calling promptUsedTokens failed (openai: ${openaiUsage.prompt_tokens}/ gpt-tokens: ${gptTokens.usedTokens})`)


            const responseMessage = response.choices[0].message

            // Step 2: check if the model wanted to call a function
            const toolCalls = responseMessage.tool_calls

            if (responseMessage.tool_calls) {
                // Step 3: call the function
                // Note: the JSON response may not always be valid; be sure to handle errors

                const availableFunctions = {
                    get_product_price: getProductPrice,
                } // only one function in this example, but you can have multiple

                messages.push(responseMessage) // extend conversation with assistant's reply

                for (const toolCall of toolCalls) {
                    const functionName     = toolCall.function.name
                    const functionToCall   = availableFunctions[functionName]
                    const functionArgs     = JSON.parse(toolCall.function.arguments)
                    const functionResponse = functionToCall(
                        functionArgs.store,
                        functionArgs.product,
                        functionArgs.unit,
                    )

                    messages.push({
                        tool_call_id: toolCall.id,
                        role        : 'tool',
                        name        : functionName,
                        content     : functionResponse,
                    }) // extend conversation with function response
                }

                const secondResponse = await openai.chat.completions.create({
                    model   : 'gpt-3.5-turbo-1106',
                    messages: messages,
                }) // get a new response from the model where it can see the function response

                return secondResponse.choices
            }
        }

        await runConversation()
    }
}

async function testFineTune() {
    console.info('Testing fine-tune...')

    const model    = 'ft:gpt-3.5-turbo-1106:opensftp::8IWeqPit'
    const messages = [{ role: 'system', content: 'You are a helpful assistant.' }]

    const completion = await openai.chat.completions.create({
        messages,
        model,
    })

    const { usage: openaiUsage } = completion

    const gptTokens = new GPTTokens({
        fineTuneModel: model,
        messages,
    })

    if (gptTokens.usedTokens !== openaiUsage.prompt_tokens)
        throw new Error(`Test fine-tune promptUsedTokens failed (openai: ${openaiUsage.prompt_tokens}/ gpt-tokens: ${gptTokens.usedTokens})`)

    console.info('Pass!')
}

async function start() {
    await testBasic('How are u')

    await testFunctionCalling()

    await testFineTune()

    testTraining('./fine-tuning-data.jsonl')

    testPerformance([
        {
            role   : 'user',
            content: 'Hello world',
        },
    ])
}

start().then()

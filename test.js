const fs                           = require('fs')
const OpenAI                       = require('openai')
const { GPTTokens, testGPTTokens } = require('./index')

const [apiKey = process.env.OPENAI_API_KEY] = process.argv.slice(2)

if (!apiKey) {
    console.error('No API key provided. Ignoring test.')
    process.exit(0)
}

const openai = new OpenAI({ apiKey })

async function basic (prompt) {
    console.info('Testing GPT...')

    await testGPTTokens(openai, prompt)
}

function fineTune (filepath) {
    console.info('Testing Create a fine-tuned model...')

    console.log(new GPTTokens({
        model   : 'gpt-3.5-turbo-1106',
        fineTune: {
            data  : fs
                .readFileSync(filepath, 'utf-8')
                .split('\n')
                .filter(Boolean)
                .map(row => JSON.parse(row)),
            epochs: 7,
        },
    }).usedTokens)
}

function performance (messages) {
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

async function functionCalling1 () {
    // https://platform.openai.com/docs/guides/function-calling

    // Example dummy function hard coded to return the same weather
    // In production, this could be your backend API or an external API
    function getCurrentWeather (location, unit = 'fahrenheit') {
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

    async function runConversation () {
        // Step 1: send the conversation and available functions to the model
        const messages = [
            { role: 'user', content: 'What\'s the weather like in San Francisco and Paris?' },
        ]

        const tools = [
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

        console.log('Step-1 messages:', messages)

        const response = await openai.chat.completions.create({
            model      : 'gpt-3.5-turbo-1106',
            messages   : messages,
            tools      : tools,
            tool_choice: 'auto', // auto is default, but we'll be explicit
        })

        console.log('Step-1 response:', response)

        const responseMessage = response.choices[0].message

        console.log('responseMessage', responseMessage, JSON.stringify(responseMessage))

        // {
        //     "role": "assistant",
        //     "content": null,
        //     "tool_calls": [
        //     {
        //         "id": "call_NjQ2zj1ULj7pj7rD08Tg1hCm",
        //         "type": "function",
        //         "function": {
        //             "name": "get_current_weather",
        //             "arguments": "{\"location\": \"San Francisco\", \"unit\": \"celsius\"}"
        //         }
        //     },
        //     {
        //         "id": "call_2yggi4Lawuxe0zYZqLu8VlnL",
        //         "type": "function",
        //         "function": {
        //             "name": "get_current_weather",
        //             "arguments": "{\"location\": \"Tokyo\", \"unit\": \"celsius\"}"
        //         }
        //     },
        //     {
        //         "id": "call_n4EtB9q8yuMcRRfRM3FpNBFI",
        //         "type": "function",
        //         "function": {
        //             "name": "get_current_weather",
        //             "arguments": "{\"location\": \"Paris\", \"unit\": \"celsius\"}"
        //         }
        //     }
        // ]
        // }

        // Step 2: check if the model wanted to call a function
        const toolCalls = responseMessage.tool_calls

        console.log('toolCalls', toolCalls, JSON.stringify(toolCalls))

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

            console.log('Step-2 messages:', messages)

            const secondResponse = await openai.chat.completions.create({
                model   : 'gpt-3.5-turbo-1106',
                messages: messages,
            }) // get a new response from the model where it can see the function response

            console.log('Step-2 response:', secondResponse)

            return secondResponse.choices
        }
    }

    runConversation().then(console.log).catch(console.error)
}

async function functionCalling2 () {
    // https://platform.openai.com/docs/guides/function-calling

    // Example dummy function hard coded to return the same weather
    // In production, this could be your backend API or an external API
    function getProductPrice (store, product) {
        return JSON.stringify({
            store: store.toUpperCase(),
            product,
            price: (Math.random() * 100).toFixed(0),
            unit : '$',
        })
    }

    async function runConversation () {
        // Step 1: send the conversation and available functions to the model
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

        console.log('Step-1 messages:', messages)

        const response = await openai.chat.completions.create({
            model      : 'gpt-3.5-turbo-1106',
            messages   : messages,
            tools      : tools,
            tool_choice: 'auto', // auto is default, but we'll be explicit
        })

        console.log('Step-1 response:', response)

        const responseMessage = response.choices[0].message

        console.log('responseMessage', responseMessage, JSON.stringify(responseMessage))

        // Step 2: check if the model wanted to call a function
        const toolCalls = responseMessage.tool_calls

        console.log('toolCalls', toolCalls, JSON.stringify(toolCalls))

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

            console.log('Step-2 messages:', messages)

            const secondResponse = await openai.chat.completions.create({
                model   : 'gpt-3.5-turbo-1106',
                messages: messages,
            }) // get a new response from the model where it can see the function response

            console.log('Step-2 response:', secondResponse)

            return secondResponse.choices
        }
    }

    runConversation().then(console.log).catch(console.error)
}

async function start () {
    await basic('How are u')

    fineTune('./fine-tuning-data.jsonl')

    performance([
        {
            role   : 'user',
            content: 'Hello world',
        },
    ])

    // TODO: Test function calling

    await functionCalling1()

    await functionCalling2()

    // TODO: Test fine-tune
}

start().then()

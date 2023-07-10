import { Configuration, OpenAIApi } from 'openai'
// @ts-ignore
import { GPTTokens }                from './index.ts'

const configuration = new Configuration({
    apiKey: '',
})
const openai        = new OpenAIApi(configuration)
const model         = 'gpt-3.5-turbo-0613'

// Example dummy function hard coded to return the same weather
// In production, this could be your backend API or an external API
function getCurrentWeather (location: string, unit: string = 'fahrenheit'): string {
    const weatherInfo = {
        location   : location,
        temperature: '72',
        unit       : unit,
        forecast   : ['sunny', 'windy'],
    }
    return JSON.stringify(weatherInfo)
}

async function runConversation () {
    // Step 1: send the conversation and available functions to GPT
    const messages: any = [
        { role: 'user', content: 'What\'s the weather like in Boston?' },
    ]

    const functions = [
        {
            name       : 'get_current_weather',
            description: 'Get the current weather in a given location (Ex: city / province / state / country)',
            parameters : {
                type      : 'object',
                properties: {
                    location: {
                        type       : 'string',
                        description: 'The city and state, e.g. San Francisco, CA, LA, 西安, 北京市, 河南省, Japan',
                    },
                    unit    : {
                        type: 'string',
                        enum: ['celsius', 'fahrenheit'],
                    },
                },
                required  : ['location', 'unit'],
            },
        },
    ]

    const response = await openai.createChatCompletion({
        model,
        messages,
        functions,
        function_call: 'auto',  // auto is default, but we'll be explicit
    })

    const responseMessage = response.data.choices[0].message

    console.log('First prompt messages:', messages)
    console.log('First completion message:', responseMessage)
    console.log('First completion usage:', response.data.usage)

    console.log('--------------')

    // Step 2: check if GPT wanted to call a function
    if (responseMessage?.function_call) {
        // Step 3: call the function
        // Note: the JSON response may not always be valid; be sure to handle errors
        const availableFunctions: {
            [key: string]: (...args: any) => void
        }                      = {
            get_current_weather: getCurrentWeather,
        }  // only one function in this example, but you can have multiple
        const functionName     = responseMessage.function_call.name
        const functionToCall   = availableFunctions[functionName || '']
        const functionArgs     = JSON.parse(responseMessage?.function_call?.arguments || '')
        const functionResponse = functionToCall(
            functionArgs.location,
            functionArgs.unit,
        )

        // Step 4: send the info on the function call and function response to GPT
        messages.push(responseMessage)  // extend conversation with assistant's reply
        messages.push(
            {
                role   : 'function',
                name   : functionName,
                content: functionResponse,
            },
        )

        // extend conversation with function response
        const secondResponse = await openai.createChatCompletion({
            model,
            messages,
        })

        const secondResponseMessage = secondResponse.data.choices[0].message

        console.log('Second prompt messages:', messages)
        console.log('Second completion message:', secondResponseMessage)
        console.log('Second completion usage:', secondResponse.data.usage)

        console.log('--------------')

        messages.push(secondResponseMessage)

        console.log(messages)
    }
}

runConversation().then()

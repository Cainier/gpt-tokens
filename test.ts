import { Configuration, OpenAIApi } from 'openai'
import { GPTTokens }                from './index'

const configuration = new Configuration({
    apiKey: '',
})

const openai = new OpenAIApi(configuration)

async function test () {
    const model         = 'gpt-3.5-turbo-0613'
    const messages: any = [
        {
            role   : 'system',
            content: 'Summarize user-generated content',
        },
        {
            role   : 'user',
            content: 'Chat models take a list of messages as input and return a model-generated message as output. Although the chat format is designed to make multi-turn conversations easy, it’s just as useful for single-turn tasks without any conversation.',
        },
    ]

    const chatCompletion = await openai.createChatCompletion({
        model,
        messages,
    })

    const responseMessage = chatCompletion.data.choices[0].message

    console.log('Response content:', responseMessage)
    console.log('Usage:', chatCompletion.data.usage)
    console.log('---------------------------------')

    const checkPrompt = new GPTTokens({
        model,
        messages,
    })

    const checkPromptWithCompletion = new GPTTokens({
        model,
        messages: [
            ...messages,
            ...[responseMessage],
        ],
    })

    console.log('gpt-tokens prompt:', checkPrompt.usedTokens)
    console.log('gpt-tokens all:', checkPromptWithCompletion.usedTokens)
}

test().then()

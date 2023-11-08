const OpenAI                       = require('openai')
const { GPTTokens, testGPTTokens } = require('./index');

(async () => {
    const [apiKey = process.env.OPENAI_API_KEY] = process.argv.slice(2)

    const openai = new OpenAI({ apiKey })

    console.info('Testing GPT...')
    await testGPTTokens(openai)

    console.info('Testing performance...')
    for (let i = 0; i < 10; i++) {
        console.time('GPTTokens')
        const usageInfo = new GPTTokens({
            plus    : false,
            model   : 'gpt-3.5-turbo-0613',
            messages: [
                {
                    role   : 'user',
                    content: 'Hello world',
                },
            ],
        })

        usageInfo.usedTokens
        usageInfo.promptUsedTokens
        usageInfo.completionUsedTokens
        usageInfo.usedUSD
        console.timeEnd('GPTTokens')
    }
})()

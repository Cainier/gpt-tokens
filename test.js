const OpenAI                       = require('openai')
const { createReadStream }         = require('fs')
const { GPTTokens, testGPTTokens } = require('./index');

(async () => {
    const [apiKey = process.env.OPENAI_API_KEY] = process.argv.slice(2)

    const openai = new OpenAI({ apiKey })

    // console.log('Testing GPT...')
    // await testGPTTokens(openai)

    console.log('Testing Fine-tune')
    const file       = await openai.files.create({
        file   : createReadStream('./fine-tuning-data.jsonl'),
        purpose: 'fine-tune',
    })
    console.log('file',file)
    const fineTune   = await openai.fineTuning.jobs.create({
        training_file: file.id,
        model        : 'gpt-3.5-turbo-1106',
    })
    console.log('fineTune',fineTune)
    const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
        model   : `ft:gpt-3.5-turbo-1106:${fineTune.id}`,
    })
    console.log('completion', completion)

    // console.log('Testing performance...')
    // for (let i = 0; i < 10; i++) {
    //     console.time('GPTTokens')
    //     const usageInfo = new GPTTokens({
    //         plus    : false,
    //         model   : 'gpt-3.5-turbo-0613',
    //         messages: [
    //             {
    //                 role   : 'user',
    //                 content: 'Hello world',
    //             },
    //         ],
    //     })
    //
    //     usageInfo.usedTokens
    //     usageInfo.promptUsedTokens
    //     usageInfo.completionUsedTokens
    //     usageInfo.usedUSD
    //     console.timeEnd('GPTTokens')
    // }
})()

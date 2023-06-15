const { GPTTokens } = require('./index')
const assert        = require('assert')

const list = {
    'gpt-3.5-turbo'         : { tokens: 18, usd: 0.000036 },
    'gpt-3.5-turbo-0301'    : { tokens: 18, usd: 0.000036 },
    'gpt-3.5-turbo-0613'    : { tokens: 18, usd: 0.000036 },
    'gpt-3.5-turbo-16k'     : { tokens: 18 },
    'gpt-3.5-turbo-16k-0613': { tokens: 18 },
    'gpt-4'                 : { tokens: 16 },
    'gpt-4-0314'            : { tokens: 16 },
    'gpt-4-0613'            : { tokens: 16 },
    'gpt-4-32k'             : { tokens: 16 },
    'gpt-4-32k-0314'        : { tokens: 16 },
    'gpt-4-32k-0613'        : { tokens: 16 },
}

for (const model of Object.keys(list)) {
    const { usedTokens, usedUSD } = new GPTTokens({
        model,
        messages: [
            {
                'role'   : 'system',
                'content': 'You are a helpful assistant',
            },
            {
                'role'   : 'user',
                'content': '',
            },
        ],
    })

    const { tokens, usd } = list[model]

    assert(tokens === usedTokens, `Error: Test ${model} usedTokens failed (${usedTokens}/${tokens})`)

    if (usd) assert(usd === usedUSD, `Error: Test ${model} usedUSD failed (${usedUSD}/${usd})`)
}

console.info('Success: package gpt-tokens test passed')

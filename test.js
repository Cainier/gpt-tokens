const { GPTTokens } = require('./index')
const assert        = require('assert')

const list = {
    'gpt-3.5-turbo'         : { tokens: 129 },
    'gpt-3.5-turbo-0301'    : { tokens: 127 },
    'gpt-3.5-turbo-0613'    : { tokens: 129 },
    'gpt-3.5-turbo-16k'     : { tokens: 129 },
    'gpt-3.5-turbo-16k-0613': { tokens: 129 },
    'gpt-4'                 : { tokens: 129 },
    'gpt-4-0314'            : { tokens: 129 },
    'gpt-4-0613'            : { tokens: 129 },
    'gpt-4-32k'             : { tokens: 129 },
    'gpt-4-32k-0314'        : { tokens: 129 },
    'gpt-4-32k-0613'        : { tokens: 129 },
}

const messages = [
    {
        'role'   : 'system',
        'content': 'You are a helpful, pattern-following assistant that translates corporate jargon into plain English.',
    },
    {
        'role'   : 'system',
        'name'   : 'example_user',
        'content': 'New synergies will help drive top-line growth.',
    },
    {
        'role'   : 'system',
        'name'   : 'example_assistant',
        'content': 'Things working well together will increase revenue.',
    },
    {
        'role'   : 'system',
        'name'   : 'example_user',
        'content': 'Let\'s circle back when we have more bandwidth to touch base on opportunities for increased leverage.',
    },
    {
        'role'   : 'system',
        'name'   : 'example_assistant',
        'content': 'Let\'s talk later when we\'re less busy about how to do better.',
    },
    {
        'role'   : 'user',
        'content': 'This late pivot means we don\'t have time to boil the ocean for the client deliverable.',
    },
]

for (const model of Object.keys(list)) {
    const { usedTokens, usedUSD } = new GPTTokens({
        model,
        messages,
    })

    const { tokens } = list[model]

    console.log(model, usedTokens, usedUSD)

    assert(tokens === usedTokens, `Error: Test ${model} usedTokens failed (${usedTokens}/${tokens})`)
}

console.info('Success: package gpt-tokens test passed')

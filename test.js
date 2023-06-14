const { GPTTokens } = require('./index')
const assert        = require('assert')

const testGPT3_5 = new GPTTokens({
    model   : 'gpt-3.5-turbo',
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

const testGPT3_5Plus = new GPTTokens({
    model   : 'gpt-3.5-turbo',
    plus    : true,
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

const testGPT_4 = new GPTTokens({
    model   : 'gpt-4',
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

// https://tiktokenizer.vercel.app/

assert(testGPT3_5.usedTokens === 18 && testGPT3_5.usedUSD === 0.000036,
    'Error: Test testGPT3_5 failed')
assert(testGPT3_5Plus.usedTokens === 18 && testGPT3_5Plus.usedUSD === 0.000027,
    'Error: Test testGPT3_5Plus failed')
assert(testGPT_4.usedTokens === 16,
    'Error: Test testGPT_4 failed')

console.info('Success: package gpt-tokens test passed')

# gpt-tokens

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> GPT tokens / price Calculate

## Install

```bash
# npm or yarn

npm install gpt-tokens
yarn add gpt-tokens
```

### Usage

```typescript
import { GPTTokens } from 'gpt-tokens'

const usageInfo = new GPTTokens({
    // Plus enjoy a 25% cost reduction for input tokens on GPT-3.5 Turbo (0.0015 per 1K input tokens)
    plus    : false,
    model   : 'gpt-3.5-turbo-0301',
    messages: [
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
})

// Tokens: 127
console.log('Tokens:', usageInfo.usedTokens)
// Price USD: 0.000254
console.log('Price USD: ', usageInfo.usedUSD)
```

Verify the function above in [openai-cookbook](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb)

![openai-cookbook.png](openai-cookbook.png)

## Support Models

* gpt-3.5-turbo
* gpt-3.5-turbo-0301
* gpt-3.5-turbo-0613
* gpt-3.5-turbo-16k
* gpt-3.5-turbo-16k-0613
* gpt-4
* gpt-4-0314
* gpt-4-0613
* gpt-4-32k
* gpt-4-32k-0314
* gpt-4-32k-0613

## Dependencies

- [js-tiktoken](https://github.com/dqbd/tiktoken)

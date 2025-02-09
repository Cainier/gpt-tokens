# gpt-tokens

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> GPT tokens / price Calculate

## Install

```bash
# npm or yarn

npm install gpt-tokens
yarn add gpt-tokens
```

## Support

### Basic Models

* gpt-3.5-turbo
* gpt-3.5-turbo-16k
* gpt-4
* gpt-4-32k
* gpt-4-turbo-preview
* gpt-3.5-turbo-0301
* gpt-3.5-turbo-0613
* gpt-3.5-turbo-1106
* gpt-3.5-turbo-0125
* gpt-3.5-turbo-16k-0613
* gpt-4-0314
* gpt-4-0613
* gpt-4-32k-0314
* gpt-4-32k-0613
* gpt-4-1106-preview
* gpt-4-0125-preview
* gpt-4-turbo-2024-04-09
* gpt-4-turbo
* gpt-4o
* gpt-4o-2024-05-13
* gpt-4o-2024-08-06
* gpt-4o-2024-11-20
* gpt-4o-mini
* gpt-4o-mini-2024-07-18
* o1
* o1-preview
* o1-preview-2024-09-12
* o1-mini
* o1-mini-2024-09-12
* o3-mini
* chatgpt-4o-latest

### Fine Tune Models

* ft:gpt-3.5-turbo:xxx

### Others

* Fine tune training (Not rigorously tested)
* Function calling (Not rigorously tested)

## Usage

### Basic chat messages

```typescript
import { GPTTokens } from 'gpt-tokens'

const usageInfo = new GPTTokens({
    model   : 'gpt-3.5-turbo-1106',
    messages: [
        { 'role' :'system', 'content': 'You are a helpful, pattern-following assistant that translates corporate jargon into plain English.' },
        { 'role' :'user',   'content': 'This late pivot means we don\'t have time to boil the ocean for the client deliverable.' },
    ]
})

console.info('Used tokens: ', usageInfo.usedTokens)
console.info('Used USD: ',    usageInfo.usedUSD)
```

### Fine tune training

```typescript
import { GPTTokens } from 'gpt-tokens'

const usageInfo = new GPTTokens({
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

console.info('Used tokens: ', usageInfo.usedTokens)
console.info('Used USD: ',    usageInfo.usedUSD)
```

### Fine tune chat messages

```typescript
import { GPTTokens } from 'gpt-tokens'

const usageInfo = new GPTTokens({
    fineTuneModel: 'ft:gpt-3.5-turbo-1106:opensftp::8IWeqPit',
    messages     : [
        { role: 'system', content: 'You are a helpful assistant.' },
    ],
})

console.info('Used tokens: ', usageInfo.usedTokens)
console.info('Used USD: ',    usageInfo.usedUSD)
```

### Function calling

```typescript
import { GPTTokens } from 'gpt-tokens'

const usageInfo = new GPTTokens({
    model   : 'gpt-3.5-turbo-1106',
    messages: [
        { role: 'user', content: 'What\'s the weather like in San Francisco and Paris?' },
    ],
    tools   : [
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
})

console.info('Used tokens: ', usageInfo.usedTokens)
console.info('Used USD: ',    usageInfo.usedUSD)
```

## Calculation method

### Basic chat messages

> Tokens calculation rules for prompt and completion:
>
> If the role of the last element of messages is not assistant, the entire messages will be regarded as a prompt, and **all content** will participate in the calculation of tokens
>
> If the role of the last element of messages is assistant, the last message is regarded as the completion returned by openai, and **only the 'content' content** in the completion participates in the calculation of tokens

Verify the function above in [openai-cookbook](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb)

![openai-cookbook.png](openai-cookbook.png)

### Function calling

Thanks for hmarr

https://hmarr.com/blog/counting-openai-tokens/

## Test in your project

```bash
node test.js yourOpenAIAPIKey
```

## Dependencies

- [js-tiktoken](https://github.com/dqbd/tiktoken)
- [openai-chat-tokens](https://github.com/hmarr/openai-chat-tokens#readme)

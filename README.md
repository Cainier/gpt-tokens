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
* gpt-3.5-turbo-0301
* gpt-3.5-turbo-0613
* gpt-3.5-turbo-1106
* gpt-3.5-turbo-16k
* gpt-3.5-turbo-16k-0613
* gpt-4
* gpt-4-0314
* gpt-4-0613
* gpt-4-32k  (Not tested)
* gpt-4-32k-0314  (Not tested)
* gpt-4-32k-0613  (Not tested)
* gpt-4-1106-preview

### Fine Tune Models

* ft:gpt-3.5-turbo:xxx
* ft:gpt-3.5-turbo-1106:xxx
* ft:gpt-3.5-turbo-0613:xxx
* ft:gpt-4:xxx (Not tested)

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
node test.js yourAPIKey

#    Testing GPT...
#    [1/13]: Testing gpt-3.5-turbo-0301...
#    Pass!
#    [2/13]: Testing gpt-3.5-turbo...
#    Warning: gpt-3.5-turbo may update over time. Returning num tokens assuming gpt-3.5-turbo-0613
#    Pass!
#    [3/13]: Testing gpt-3.5-turbo-0613...
#    Pass!
#    [4/13]: Testing gpt-3.5-turbo-16k...
#    Warning: gpt-3.5-turbo-16k may update over time. Returning num tokens assuming gpt-3.5-turbo-16k-0613
#    Pass!
#    [5/13]: Testing gpt-3.5-turbo-16k-0613...
#    Pass!
#    [6/13]: Testing gpt-3.5-turbo-1106...
#    Pass!
#    [7/13]: Testing gpt-4...
#    Warning: gpt-4 may update over time. Returning num tokens assuming gpt-4-0613
#    Pass!
#    [8/13]: Testing gpt-4-0314...
#    Pass!
#    [9/13]: Testing gpt-4-0613...
#    Pass!
#    [10/13]: Testing gpt-4-32k...
#    Ignore model gpt-4-32k: 404 The model `gpt-4-32k` does not exist or you do not have access to it. Learn more: https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4.
#    Warning: gpt-4-32k may update over time. Returning num tokens assuming gpt-4-32k-0613
#    [11/13]: Testing gpt-4-32k-0314...
#    Ignore model gpt-4-32k-0314: 404 The model `gpt-4-32k-0314` does not exist or you do not have access to it. Learn more: https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4.
#    [12/13]: Testing gpt-4-32k-0613...
#    Ignore model gpt-4-32k-0613: 404 The model `gpt-4-32k-0613` does not exist or you do not have access to it. Learn more: https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4.
#    [13/13]: Testing gpt-4-1106-preview...
#    Pass!
#    Test success!
#    Testing performance...
#    GPTTokens: 0.473ms
#    GPTTokens: 0.097ms
#    GPTTokens: 0.072ms
#    GPTTokens: 0.079ms
#    GPTTokens: 0.095ms
#    GPTTokens: 0.066ms
#    GPTTokens: 0.064ms
#    GPTTokens: 0.068ms
#    GPTTokens: 0.077ms
#    GPTTokens: 0.08ms
```

## Dependencies

- [js-tiktoken](https://github.com/dqbd/tiktoken)
- [openai-chat-tokens](https://github.com/hmarr/openai-chat-tokens#readme)

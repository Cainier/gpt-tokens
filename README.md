# gpt-tokens

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
    model: 'gpt-3.5-turbo',
    messages: [
        {
            'role'   : 'system',
            'content': 'You are a helpful assistant',
        },
        {
            'role'   : 'user',
            'content': '',
        },
    ]
})

// Tokens: 18
console.log('Tokens:', usageInfo.usedTokens)
// Price USD: 0.000036
console.log('Price USD: ', usageInfo.usedUSD)
```

You can test in [Tiktokenizer](https://tiktokenizer.vercel.app/)

![img.png](Tiktokenizer.png)

## Support Models

* gpt-3.5-turbo
* gpt-3.5-turbo-0301
* gpt-4
* gpt-4-0314
* gpt-4-32k
* gpt-4-32k-0314

## Dependencies

- OpenAI tiktoken (Python lib) [openai/tiktoken](https://github.com/openai/tiktoken)
- @dqbd/titoken (Typescript)  [dqbd/tiktoken](https://github.com/dqbd/tiktoken)

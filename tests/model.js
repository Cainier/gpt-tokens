const OpenAI = require('openai')

const [apiKey = process.env.OPENAI_API_KEY] = process.argv.slice(2)

const openai = new OpenAI({ apiKey })

const messages = [
    { role: 'user', content: 'How are u' },
]

openai.chat.completions.create({
    model: 'chatgpt-4o-latest',
    messages,
})
    .then(res => {
        console.info(res.choices[0].message.content)
    })
    .catch(err => {
        console.error(err.message)
    })

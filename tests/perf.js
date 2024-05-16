const { GPTTokens } = require('../dist/index')

function executionTime(callback, ...args) {
  const start = performance.now()
  callback.apply(this, ...args)
  const end = performance.now()
  return {start, end}
}

const roundDecimal = (num, precision) => Math.round((num + Number.EPSILON) * (10 ** precision)) / (10 ** precision)

function benchmark({ options, iterations=1000, log=false }) {
  console.info('Testing performance...')
  console.info(`Options: ${JSON.stringify(options)}, iterations: ${iterations}\n`)

  // total execution time = sum(execution time of each single task)
  const sumExecutionTime = () => {
    // Initialize and trigger caching
    const usageInfo = new GPTTokens(options)
    usageInfo.usedTokens

    const tasks = [
      {name: "usedTokens" , worker: () => usageInfo.usedTokens},
      {name: "promptUsedTokens" , worker: () => usageInfo.promptUsedTokens},
      {name: "completionUsedTokens" , worker: () => usageInfo.completionUsedTokens},
      {name: "usedUSD" , worker: () => usageInfo.usedUSD},
    ]
    let total = 0

    for (const task of tasks) {
      const {start, end} = executionTime(task.worker)
      const diff = end - start
      log && console.log(`-> ${task.name} time: ${roundDecimal(diff, 5)}`)
      total += diff
    }

    log && console.log(`Total time: ${roundDecimal(total, 5)}\n`)
    return total   
  }

  let totalExecutionTime = 0;
  for (let i = 0; i < iterations; i++) {
    totalExecutionTime += sumExecutionTime()
  }

  return totalExecutionTime
}

console.log(`>>> Start of Test Result >>>`)

console.log(`>>> Start of Batch 1 >>>`)
benchmark({
  options: {
    model: 'gpt-3.5-turbo-0613',
    messages: [{
      role   : 'user',
      content: 'Hello world',
    }],
  },
  iterations: 20,
  log: true
})
console.log(`>>> End of Batch 1 >>>`)

console.log(`>>> Start of Batch 2 >>>`)

const results = []
const settings = []

const template = (iteration) => {
  return {
    options: {
      model: 'gpt-3.5-turbo-0613',
      messages: [{
        role   : 'user',
        content: 'Hello world',
      }],
    },
    iterations: iteration,
  }
}
settings.push(...[
                10, 
                100, 
                1000, 
                10000, 
                100000,
                500000,
                1000000
              ].map(v => template(v)))

for (const setting of settings) {
  const totalExecutionTime = benchmark(setting)
  results.push({setting: setting, exeTime: totalExecutionTime})
}

console.log('\nStatistical Information:')
const callsPerIteration = 4
results.forEach(result => {
  const tokens = new GPTTokens(result.setting.options).usedTokens
  console.log(`Setting: ${JSON.stringify(result.setting)}`)
  console.log(`Used Tokens for Each Call: ${tokens}`)
  console.log(`Total Execution Time: ${result.exeTime}`)
  console.log(`Total Number of Iterations: ${result.setting.iterations}`)
  console.log(`Total Number of Calls per Iteration: ${4}`)
  console.log(`Avg Execution Time (per Iteration): ${roundDecimal(result.exeTime / result.setting.iterations, 5)}ms`)
  console.log(`Avg Execution Time (per Call): ${roundDecimal(result.exeTime / result.setting.iterations / callsPerIteration, 5)}ms`)
});
console.log(`>>> End of Batch 2 >>>`)

console.log(`>>> End of Test Result ( ${new Date()} ) >>>\n`)
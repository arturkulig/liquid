import {debugConsole} from './Console'

const Runner = {}
export default Runner

const jobs = []

Runner.doPromise = doPromise
function doPromise () {
  return new Promise(resolve => Runner.doNext(resolve))
}

Runner.doNext = doNext
function doNext (job, args = [], priority = 0) {
  jobs.push({job, args, priority})
  Runner.runQueue()
}

Runner.runQueue = runQueue
let isQueueRunning = false
function runQueue () {
  try {
    if (jobs.length === 0) {
      return
    }
    if (isQueueRunning) {
      return
    }
    isQueueRunning = true

    let highestPriorityJobPosition = 0
    for (let i = 1; i < jobs.length; i++) {
      if (jobs[highestPriorityJobPosition].priority < jobs[i].priority) {
        highestPriorityJobPosition = i
      }
    }
    const [{job, args}] = jobs.splice(highestPriorityJobPosition, 1)
    Runner.runTask(job, args, Runner.runNext)
  } catch (e) {
    console.error(e.stack || e.message || e)
  }
}

let tasksRunInRow = 0
const MAX_TASKS_RUN_IN_ROW = 500
Runner.runNext = runNext
function runNext () {
  if (tasksRunInRow < MAX_TASKS_RUN_IN_ROW) {
    Promise.resolve().then(() => {
      isQueueRunning = false
      tasksRunInRow++
      Runner.runQueue()
    })
  } else {
    setTimeout(() => {
      isQueueRunning = false
      tasksRunInRow = 1
      Runner.runQueue()
    }, 0)
  }
}

Runner.runTask = runTask
function runTask (job, args, next) {
  switch (args.length) {
    case 0: {
      job()
      break
    }
    case 1: {
      job(args[0])
      break
    }
    case 2: {
      job(args[0], args[1])
      break
    }
    case 3: {
      job(args[0], args[1], args[2])
      break
    }
    default: {
      job.apply(null, args)
      break
    }
  }
  next()
}


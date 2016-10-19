export default function ProcessInfo (pid, finished) {
  this.pid = pid
  this.isAlive = true
  this.requests = []
  this.exitReason = 'normal'
  this.exitResult = null
  this.onExit = []
  this.onError = []

  this.toJSON = () => `#${this.pid.valueOf()}`

  this.resolution = finished.then(
    result => {
      terminate(this, 'normal', result)
    },
    reason => {
      terminate(this, 'error', reason)
    }
  ).then(() => [this.exitReason, this.exitResult])
}

ProcessInfo.new = (...args) => new ProcessInfo(...args)

ProcessInfo.pid = pInfo => pInfo.pid

ProcessInfo.pushRequestResolvers = (pInfo, [pushToReceive, rejectReceive]) => {
  if (!pInfo.isAlive) return false
  pInfo.requests.push([pushToReceive, rejectReceive])
  return true
}

ProcessInfo.takeRequestResolvers = (pInfo) => {
  if (!pInfo.isAlive) return false
  if (pInfo.requests.length === 0) return false
  const [pushToReceive] = pInfo.requests.splice(0, 1)
  return pushToReceive
}

ProcessInfo.isAlive = pInfo => pInfo && typeof pInfo === 'object' && pInfo.isAlive

ProcessInfo.getExitHandlers = pInfo => pInfo.onExit
ProcessInfo.getErrorHandlers = pInfo => pInfo.onError

ProcessInfo.pushExitHandler = (pInfo, handler) => {
  if (!pInfo) return
  if (!pInfo.isAlive) return
  const handlers = ProcessInfo.getExitHandlers(pInfo)
  handlers &&
  handlers.indexOf(handler) === -1 &&
  handlers.push(handler)
}
ProcessInfo.pushErrorHandler = (pInfo, handler) => {
  if (!pInfo) return
  if (!pInfo.isAlive) return
  const handlers = ProcessInfo.getErrorHandlers(pInfo)
  handlers &&
  handlers.indexOf(handler) === -1 &&
  handlers.push(handler)
}

ProcessInfo.raiseExit = (pInfo, result) => {
  terminate(pInfo, 'shutdown', result)
}

ProcessInfo.raiseError = (pInfo, result) => {
  terminate(pInfo, 'error', result)
}

ProcessInfo.resolution = pInfo => pInfo.resolution

function terminate (pInfo, reason, result) {
  if (!pInfo) {
    return
  }
  if (!pInfo.isAlive) {
    return
  }

  pInfo.isAlive = false

  pInfo.exitReason = reason
  pInfo.exitResult = result

  pInfo.requests
    .splice(0, pInfo.requests.length)
    .forEach(
      ([pushToReceive, rejectReceive]) => rejectReceive(reason)
    )

  switch (reason) {
    case 'error': {
      pInfo.onExit.splice(0, pInfo.onExit.length)
      pInfo.onError.splice(0, pInfo.onError.length).forEach(reaction => reaction(pInfo, result, reason))
      break
    }
    case 'normal':
    case 'shutdown': {
      pInfo.onExit.splice(0, pInfo.onExit.length).forEach(reaction => reaction(pInfo, result, reason))
      pInfo.onError.splice(0, pInfo.onError.length)
    }
  }
}


export default function ProcessInfo (pid, finished) {
  this.pid = pid
  this.isAlive = true
  this.requests = []
  this.onExit = []
  this.onError = []

  this.toJSON = () => `#${this.pid.valueOf()}`

  finished.then(
    result => ProcessInfo.raiseExit(this, result),
    reason => ProcessInfo.raiseError(this, reason)
  )
}

ProcessInfo.new = (...args) => new ProcessInfo(...args)

ProcessInfo.pid = pInfo => pInfo.pid

ProcessInfo.pushRequest = (pInfo, request) => {
  if (!pInfo.isAlive) return
  pInfo.requests.push(request)
}

ProcessInfo.takeRequest = (pInfo) => {
  if (!pInfo.isAlive) return
  return pInfo.requests.splice(0, 1)[0]
}

ProcessInfo.isAlive = pInfo => pInfo.isAlive

ProcessInfo.getExitHandlers = pInfo => pInfo.onExit
ProcessInfo.getErrorHandlers = pInfo => pInfo.onError

ProcessInfo.pushExitHandler = (pInfo, handler) => {
  if (!pInfo.isAlive) return
  const handlers = ProcessInfo.getExitHandlers(pInfo)
  handlers &&
  handlers.indexOf(handler) === -1 &&
  handlers.push(handler)
}
ProcessInfo.pushErrorHandler = (pInfo, handler) => {
  if (!pInfo.isAlive) return
  const handlers = ProcessInfo.getErrorHandlers(pInfo)
  handlers &&
  handlers.indexOf(handler) === -1 &&
  handlers.push(handler)
}

ProcessInfo.raiseExit = (pInfo, outcome) => {
  if (!pInfo.isAlive) return
  pInfo.isAlive = false
  ProcessInfo.getExitHandlers(pInfo).forEach(reaction => reaction(outcome, pInfo))
  ProcessInfo.clear(pInfo)
}
ProcessInfo.raiseError = (pInfo, outcome) => {
  if (!pInfo.isAlive) return
  pInfo.isAlive = false
  ProcessInfo.getErrorHandlers(pInfo).forEach(reaction => reaction(outcome, pInfo))
  ProcessInfo.clear(pInfo)
}

ProcessInfo.clear = pInfo => {
  pInfo.requests.splice(0, pInfo.requests.length)
  pInfo.onExit.splice(0, pInfo.onExit.length)
  pInfo.onError.splice(0, pInfo.onError.length)
}

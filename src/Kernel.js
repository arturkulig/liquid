import {
  timeout
} from './utils'
import * as ProcessList from './ProcessList'
import ProcessInfo from './ProcessInfo'
import Pid from './Pid'

const messages = []

const DEV = 0

export {
  spawn,
  send
}

function spawn (func, name) {
  if (typeof func !== 'function') {
    return [false, 'Liquid.Kernel.spawn Process must be function']
  }

  const pId = Pid.new()

  if (typeof name === 'string' && name && ProcessList.getByRef(name)) {
    return [false, 'Liquid.Kernel.spawn Process name already taken']
  }

  const pInfo = ProcessInfo.new(pId, runProcess(func, pId))

  DEV && console.log('> spawn', pId.toString())

  ProcessList.register(pId, pInfo)
  if (name) {
    ProcessList.register(name, pInfo)
  }

  const processCleanup = () => {
    DEV && console.log('> cleanup', pId.toString())
    ProcessList.unregister(pId)
    tryPushMessages()
  }

  ProcessInfo.pushExitHandler(pInfo, processCleanup)
  ProcessInfo.pushErrorHandler(pInfo, processCleanup)

  return [true, pId]
}

async function runProcess (func, pId) {
  DEV && console.log('> runProcess', pId.toString())

  await timeout()

  return func(
    () => receive(pId),
    pId
  )
}

function send (pid, message) {
  DEV && console.log('> send', pid.toString(), message)

  if (!pid) {
    return [false, 'Liquid.Kernel.send Empty ID']
  }

  if (!ProcessList.getByRef(pid)) {
    return [false, 'Liquid.Kernel.send Dead process']
  }

  return new Promise(async (resolve) => {
    await timeout()
    messages.push([pid, message, msg => setTimeout(() => resolve(msg), 0)])
    tryPushMessages()
  })
}

async function receive (pid) {
  DEV && console.log('> receive', pid.toString())

  return await new Promise((resolve) => {
    const pInfo = ProcessList.getByRef(pid)
    if (!pInfo) {
      return [false, 'Liquid.Kernel.receive Reading process is marked as gone']
    }
    ProcessInfo.pushRequest(pInfo, resolve)
    tryPushMessages()
  })
}

let isPushingMessages = false

function tryPushMessages () {
  DEV && console.log('> tryPushMessages', messages.length)

  if (!messages.length) return

  if (isPushingMessages) return
  isPushingMessages = true

  const unhandledMessages = []

  while (true) {
    const takenEntries = messages.splice(0, 1)
    if (takenEntries.length === 0) break
    const messagesEntry = takenEntries[0]
    const [pid, message, acknowledge] = messagesEntry

    const pInfo = ProcessList.getByRef(pid)
    if (!pInfo) {
      DEV && console.log('> tryPushMessages - process', pid.toString(), 'dead')
      acknowledge([false, 'Liquid.Kernel sending to dead process'])
      continue
    }

    const request = ProcessInfo.takeRequest(pInfo)
    if (!request) {
      DEV && console.log('> tryPushMessages - process', pid.toString(), 'NOT receiving')
      unhandledMessages.push(messagesEntry)
      continue
    }

    DEV && console.log('> tryPushMessages - process', pid.toString(), 'receiving')
    request(message)
    acknowledge([true, 'ok'])
  }

  DEV && console.log('> tryPushMessages, unhandled:', unhandledMessages.length)
  messages.splice(0, 0, ...unhandledMessages)

  isPushingMessages = false
}

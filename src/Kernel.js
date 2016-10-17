import {
  timeout
} from './utils'
import * as ProcessList from './ProcessList'
import ProcessInfo from './ProcessInfo'
import Pid from './Pid'
import {debugConsole} from './Console'

let messages = []

export {
  spawn,
  send
}

function spawn (func, name) {
  if (typeof func !== 'function') {
    return [false, 'Liquid.Kernel.spawn Process must be function']
  }

  const pId = Pid.new()

  if (
    typeof name === 'string' &&
    name
  ) {
    const existing = ProcessList.getByRef(name)
    if (ProcessInfo.isAlive(existing)) {
      return [false, 'Liquid.Kernel.spawn Process name already taken']
    }
  }

  const pInfo = ProcessInfo.new(pId, runProcess(func, pId))

  debugConsole.log('> spawn', pId.toString())

  ProcessList.register(pId, pInfo)
  if (
    typeof name === 'string' &&
    name
  ) {
    ProcessList.register(name, pInfo)
  }

  ProcessInfo.resolution(pInfo).then(tryPushMessages)

  return [true, pId]
}

async function runProcess (func, pId) {
  debugConsole.log('> runProcess', pId.toString())

  await timeout()

  return func(
    () => receive(pId),
    pId
  )
}

function send (pid, message) {
  debugConsole.log('> send', stringify(pid), message)

  if (!pid) {
    return [false, 'Liquid.Kernel.send Empty ID']
  }

  if (!ProcessList.getByRef(pid)) {
    return [false, 'Liquid.Kernel.send Dead process']
  }

  return new Promise(async (resolve) => {
    await timeout()
    messages.push([
      pid,
      message,
      msg => setTimeout(() => resolve(msg), 0)
    ])
    tryPushMessages()
  })
}

async function receive (pid) {
  debugConsole.log('> receive', stringify(pid))

  return await new Promise((resolve, reject) => {
    const pInfo = ProcessList.getByRef(pid)
    if (
      !pInfo ||
      !ProcessInfo.isAlive(pInfo)
    ) {
      reject(new Error('Liquid.Kernel.receive Reading process is marked as dead.'))
      return
    }
    ProcessInfo.pushRequestResolvers(pInfo, [resolve, reject])
    tryPushMessages()
  })
}

let isPushingMessages = false

function tryPushMessages () {
  debugConsole.log('> tryPushMessages', messages.length)

  if (!messages.length) return

  if (isPushingMessages) return
  isPushingMessages = true

  const unhandledMessages = []
  const acksToSend = []

  while (true) {
    const takenEntries = messages.splice(0, 1)
    if (takenEntries.length === 0) break
    const messagesEntry = takenEntries[0]
    const [pid, message, acknowledgeSend] = messagesEntry

    const pInfo = ProcessList.getByRef(pid)
    if (!pInfo) {
      debugConsole.log('> tryPushMessages - process', stringify(pid), 'does not exist')
      acknowledgeSend([false, 'Liquid.Kernel.send Dead process'])
      continue
    }

    if (!ProcessInfo.isAlive(pInfo)) {
      debugConsole.log('> tryPushMessages - process', stringify(pid), 'dead')
      acknowledgeSend([false, 'Liquid.Kernel.send Dead process'])
      continue
    }

    const receiveResolvers = ProcessInfo.takeRequestResolvers(pInfo)
    if (!receiveResolvers) {
      debugConsole.log('> tryPushMessages - process', stringify(pid), 'NOT receiving')
      unhandledMessages.push(messagesEntry)
      continue
    }

    const [pushToReceive] = receiveResolvers
    debugConsole.log('> tryPushMessages - process', stringify(pid), 'receiving')
    pushToReceive(message)
    acksToSend.push(acknowledgeSend)
  }

  debugConsole.log('> tryPushMessages, unhandled:', unhandledMessages.length)
  messages = unhandledMessages
  isPushingMessages = false

  setTimeout(() => acksToSend.forEach(ack => ack([true, 'ok'])), 0)
}

function stringify (subject) {
  if (subject && subject.toString) {
    return subject.toString()
  }
}

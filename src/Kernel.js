import * as ProcessList from './ProcessList'
import ProcessInfo from './ProcessInfo'
import Pid from './Pid'
import Runner from './Runner'
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

function runProcess (func, pId) {
  debugConsole.log('> runProcess', pId.toString())
  return new Promise((resolve, reject) => {
    Runner.doNext(() => {
      Promise.resolve().then(
        () => func(() => receive(pId), pId)
      ).then(resolve, reject)
    })
  })
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
    messages.push([
      pid,
      message,
      msg => Runner.doNext(resolve, [msg])
    ])
    tryPushMessages()
  })
}

function receive (pid) {
  debugConsole.log('> receive', stringify(pid))

  return new Promise((resolve, reject) => {
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
  if (isPushingMessages) return
  isPushingMessages = true

  Runner.doNext(tryPushMessagesDeffered, [], 3)
}

function tryPushMessagesDeffered () {
  debugConsole.log('> tryPushMessages', messages.length)

  if (!messages.length) {
    isPushingMessages = false
    return
  }

  const unhandledMessages = []

  while (true) {
    const takenEntries = messages.splice(0, 1)
    if (takenEntries.length === 0) break
    const messagesEntry = takenEntries[0]
    const [pid, message, acknowledgeSend] = messagesEntry

    const pInfo = ProcessList.getByRef(pid)
    if (!pInfo) {
      debugConsole.log('> tryPushMessages - process', stringify(pid), 'does not exist')
      Runner.doNext(acknowledgeSend, [[false, 'Liquid.Kernel.send Dead process']])
      continue
    }

    if (!ProcessInfo.isAlive(pInfo)) {
      debugConsole.log('> tryPushMessages - process', stringify(pid), 'dead')
      Runner.doNext(acknowledgeSend, [[false, 'Liquid.Kernel.send Dead process']])
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
    Runner.doNext(pushToReceive, [message], 2)
    Runner.doNext(acknowledgeSend, [[true, 'ok']], 1)
  }

  debugConsole.log('> tryPushMessages, unhandled:', unhandledMessages.length)
  messages = unhandledMessages
  isPushingMessages = false
}

function stringify (subject) {
  if (subject && subject.toString) {
    return subject.toString()
  }
}

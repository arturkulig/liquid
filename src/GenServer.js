import {spawn, send} from './Kernel'
import * as Process from './Process'
import {externalConsole} from './Console'
import {noop} from './utils'
import createSymbol from './createSymbol'

const STOP = createSymbol('STOP')

export function start (handler = noop, name) {
  return spawn(async (receive, pid) => {
    let state

    while (true) {
      const [payload, resolve] = await receive()

      if (payload === STOP) {
        Process.endOf(pid).then(() => resolve([true, STOP]))
        return
      }

      try {
        const [reply, newState] = await handler(payload, state, pid)
        state = newState
        resolve([true, reply])
      } catch (e) {
        externalConsole.error(
          `Liquid.GenServer ${
            name || 'GenServer'
          } handler caused error due to`,
          payload
        )
        externalConsole.error(
          e.stack || e.message || e
        )
        resolve([false, 'Liquid.GenServer handler committed an error', e])
      }
    }
  }, name)
}

export function call (genServerPID, payload) {
  if (!Process.isAlive(genServerPID)) {
    return [false, 'Liquid.GenServer.call process is dead']
  }
  return new Promise(async resolve => {
    try {
      await send(genServerPID, [payload, resolve])
    } catch (e) {
      resolve([false, e])
    }
  })
}

export function stop (genServerPID) {
  if (!Process.isAlive(genServerPID)) {
    return [false, 'Liquid.GenServer.call process is dead']
  }
  return call(genServerPID, STOP)
}

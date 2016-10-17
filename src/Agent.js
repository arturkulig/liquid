import * as GenServer from './GenServer'
import {externalConsole} from './Console'
import createSymbol from './createSymbol'

const GET = createSymbol('GET')
const GET_AND_UPDATE = createSymbol('GET_AND_UPDATE')
const UPDATE = createSymbol('UPDATE')

export function start (name) {
  return GenServer.start(
    async (payload, state) => {
      const [command, ...args] = payload
      switch (command) {
        case GET: {
          const [getter] = args
          const reply = await getter(state)
          return [reply, state]
        }

        case GET_AND_UPDATE: {
          const [updater] = args
          const result = await updater(state)
          if (!(result instanceof Array)) {
            externalConsole.error([
              'Liquid.Agent.getAndUpdate',
              'Update result is not an array.',
              'Expect two elements array: [reply, newState]'
            ])
          }
          return result
        }

        case UPDATE: {
          const [updater] = args
          const reply = await updater(state)
          return [reply, reply]
        }
      }
    },
    name
  )
}

export function get (agentPID, getter) {
  return GenServer.call(agentPID, [GET, getter])
}

export function getAndUpdate (agentPID, updater) {
  return GenServer.call(agentPID, [GET_AND_UPDATE, updater])
}

export function update (agentPID, updater) {
  return GenServer.call(agentPID, [UPDATE, updater])
}

export function stop (agentPID) {
  return GenServer.stop(agentPID)
}


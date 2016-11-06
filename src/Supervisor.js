import {spawn, send} from './Kernel'
import * as strategies from './Supervisor.strategies'
import {
  startLinkAll,
  exitGracefully
} from './Supervisor.runners'
import {externalConsole, debugConsole} from './Console'

const reasons = ['normal', 'error']

export async function stop (pid, reason = 'normal') {
  if (reasons.indexOf(reason) === -1) {
    const errorMsg = 'Liquid.Supervisor.stop Incorrect reason'
    externalConsole.error(errorMsg)
    return [false, errorMsg]
  }
  return new Promise(resolve => send(pid, [`supervisor_exit_${reason}`, resolve]))
}

export async function countChildren (pid) {
  return new Promise((resolve, reject) => {
    try {
      send(pid, ['supervisor_count', resolve])
    } catch (e) {
      reject(e)
    }
  })
}

export async function deleteChild (pid, child) {
  //TODO
  throw new Error('Not Implemented')
}

export async function restartChild (pid, child) {
  //TODO
  throw new Error('Not Implemented')
}

export async function startChild (pid, child) {
  //TODO
  throw new Error('Not Implemented')
}

export async function start (childrenFormulas, {strategy = 'one_for_one', name} = {}) {
  let childrenRunning

  if (!(strategy in strategies)) {
    return [false, `Liquid.Supervisor.start Incorrect strategy ${strategy}`]
  }

  const [ok, sv] = spawn(
    async (receive, sv) => {
      while (true) {
        const [event, ...eventArgs] = await receive()

        switch (event) {
          case 'normal':
          case 'shutdown':
          case 'error': {
            const [pid] = eventArgs

            const pidPos = childrenRunning.indexOf(pid)
            if (pidPos === -1) {
              break
            }
            try {
              childrenRunning = await strategies[strategy](sv, childrenFormulas, childrenRunning, pidPos, event)
            } catch (e) {
              debugConsole.error('Liquid.Supervisor error executing strategy', strategy, e.stack || e.message || e)
            }
            break
          }
          case 'supervisor_exit_normal': {
            const [ack] = eventArgs
            exitGracefully(sv, childrenRunning).then(ack)
            return
          }
          case 'supervisor_exit_error': {
            const [ack] = eventArgs
            exitGracefully(sv, childrenRunning).then(ack)
            throw new Error('Supervisor ending process')
          }
          case 'supervisor_count': {
            const [respond] = eventArgs
            respond({
              spec: childrenFormulas.length,
              active: childrenRunning.filter(v => Process.isAlive(v)).length
            })
          }
        }
      }
    },
    name
  )

  if (!ok) {
    return [ok, sv]
  }

  childrenRunning = await startLinkAll(childrenFormulas, sv)

  return [ok, sv]
}


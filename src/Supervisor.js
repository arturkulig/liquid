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
  return new Promise(resolve => send(pid, [`supervisor_${reason}`, resolve]))
}

export async function countChildren (pid) {

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
              debugConsole.error(e.stack || e.message || e)
            }
            break
          }
          case 'supervisor_normal': {
            const [ack] = eventArgs
            exitGracefully(sv, childrenRunning).then(ack)
            return
          }
          case 'supervisor_error': {
            const [ack] = eventArgs
            exitGracefully(sv, childrenRunning).then(ack)
            throw new Error('Supervisor ending process')
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


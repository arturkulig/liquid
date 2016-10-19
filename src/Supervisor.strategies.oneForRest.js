import {spawn, send} from './Kernel'
import * as Process from './Process'
import {
  runFormula,
  startLinkAll,
  exitGracefully
} from './Supervisor.runners'

export default async function oneForRest (childrenFormulas, name) {
  let childrenRunning

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

            for (let i = pidPos; i < childrenRunning.length; i++) {
              await Process.demonitor(childrenRunning[i], sv)
              await Process.exit(childrenRunning[i])
              const [ok, newProcPid] = await runFormula(childrenFormulas[i])
              if (!ok) {
                send(sv, ['error', pid])
                break
              }

              childrenRunning[i] = newProcPid
              Process.monitor(newProcPid, sv)
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

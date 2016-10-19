import {spawn, send} from './Kernel'
import * as Process from './Process'
import {
  runFormula,
  startLinkAll,
  exitGracefully
} from './Supervisor.runners'
import {externalConsole} from './Console'

export default async function oneForOne (childrenFormulas, name) {
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

            const [ok, newProcPid] = await runFormula(childrenFormulas[pidPos])
            if (!ok) {
              externalConsole.error(
                'Liquid.Supervisor Cannot run',
                childrenFormulas[pidPos].name || childrenFormulas[pidPos]
              )
              externalConsole.error(ok, newProcPid)
              send(sv, ['error', pid])
              break
            }

            childrenRunning[pidPos] = newProcPid
            Process.monitor(newProcPid, sv)

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

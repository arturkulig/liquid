import {spawn, send} from './Kernel'
import * as Process from './Process'
import {
  runFormula,
  startLinkAll,
  exitGracefully
} from './Supervisor.runners'

export default async function oneForAll (childrenFormulas, name) {
  let childrenRunning

  const [ok, sv] = spawn(async (receive, sv) => {
    while (true) {
      const [event, ...eventArgs] = await receive()

      switch (event) {
        case 'normal':
        case 'shutdown':
        case 'error': {
          for (let i = 0; i < childrenRunning.length; i++) {
            if (childrenRunning[i]) {
              await Process.demonitor(childrenRunning[i], sv)
              await Process.exit(childrenRunning[i], event)
              const [fOk, fNewPid] = await runFormula(childrenFormulas[i])
              if (!fOk) {
                send(sv, ['error', childrenRunning[i]])
              } else {
                childrenRunning[i] = fNewPid
                Process.monitor(fNewPid, sv)
              }
            }
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
  }, name)

  if (!ok) {
    return [ok, sv]
  }

  childrenRunning = await startLinkAll(childrenFormulas, sv)

  return [ok, sv]
}

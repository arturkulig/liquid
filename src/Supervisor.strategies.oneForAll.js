import {spawn, send} from './Kernel'
import * as Process from './Process'
import {
  runFormula,
  startLinkAll
} from './Supervisor.runners'

export default async function oneForAll (childrenFormulas, name) {
  let childrenRunning

  const [ok, sv] = spawn(async (receive, sv) => {
    while (true) {
      const [cause] = await receive()

      switch (cause) {
        case 'normal':
        case 'shutdown':
        case 'error': {
          for (let i = 0; i < childrenRunning.length; i++) {
            if (childrenRunning[i]) {
              await Process.demonitor(childrenRunning[i], sv)
              await Process.exit(childrenRunning[i], cause)
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
        case 'supervisor_normal': return
        case 'supervisor_error': throw new Error()
      }
    }
  }, name)

  if (!ok) {
    return [ok, sv]
  }

  childrenRunning = await startLinkAll(childrenFormulas, sv)

  return [ok, sv]
}

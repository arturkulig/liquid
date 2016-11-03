import {send} from './Kernel'
import {externalConsole} from './Console'
import * as Process from './Process'
import {
  runFormula
} from './Supervisor.runners'

export default async function oneForAll (svPID, childrenFormulas, childrenRunning, childPIDPosition, reason) {
  const newChildrenRunning = []

  for (let i = 0; i < childrenRunning.length; i++) {
    if (!childrenRunning[i]) {
      continue
    }
    await Process.demonitor(childrenRunning[i], svPID)
    await Process.exit(childrenRunning[i], 'shutdown')
    const [fOk, fNewPid] = await runFormula(childrenFormulas[i])
    if (fOk !== true) {
      externalConsole.error('Liquid.Supervisor oneForAll could not restart child', childrenFormulas[i])
      send(svPID, ['error', childrenRunning[i]])
      newChildrenRunning[i] = childrenRunning[i]
    } else {
      Process.monitor(fNewPid, svPID)
      newChildrenRunning[i] = fNewPid
    }
  }

  return newChildrenRunning
}

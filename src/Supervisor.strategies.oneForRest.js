import {send} from './Kernel'
import * as Process from './Process'
import {
  runFormula
} from './Supervisor.runners'

export default async function oneForRest (svPID, childrenFormulas, childrenRunning, childPIDPosition, reason) {
  const newChildrenRunning = []

  for (let i = childPIDPosition; i < childrenRunning.length; i++) {
    if (!childrenRunning[i]) {
      continue
    }

    await Process.demonitor(childrenRunning[i], svPID)
    await Process.exit(childrenRunning[i], 'shutdown')
    const [ok, newProcPid] = await runFormula(childrenFormulas[i])

    if (!ok) {
      send(svPID, ['error', childrenRunning[i]])
      newChildrenRunning[i] = childrenRunning[i]
      continue
    }

    Process.monitor(newProcPid, svPID)
    newChildrenRunning[i] = newProcPid
  }
  return newChildrenRunning
}

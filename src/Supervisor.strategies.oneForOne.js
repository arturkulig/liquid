import {send} from './Kernel'
import * as Process from './Process'
import {
  runFormula
} from './Supervisor.runners'
import {externalConsole} from './Console'

export default async function oneForOne (svPID, childrenFormulas, childrenRunning, childPIDPosition, reason) {
  const [ok, newProcPid] = await runFormula(childrenFormulas[childPIDPosition])

  if (ok !== true) {
    externalConsole.error(
      'Liquid.Supervisor Cannot run',
      childrenFormulas[childPIDPosition].name || childrenFormulas[childPIDPosition]
      )
    externalConsole.error(ok, newProcPid)
    send(svPID, ['error', childrenRunning[childPIDPosition]])
    return childrenRunning
  }

  const newChildrenRunning = [].concat(childrenRunning)
  newChildrenRunning[childPIDPosition] = newProcPid
  await Process.monitor(newProcPid, svPID)

  return newChildrenRunning
}

import * as Kernel from './Kernel'
import ProcessInfo from './ProcessInfo'
import {
  removeLink,
  ifLinkExists,
  splice,
  getPInfo
} from './Process.utils.js'

const monitorLinks = []

export function monitor (sourcePID, targetPID) {
  if (!sourcePID || !targetPID) {
    return [false, 'Liquid.Process.monitor Insufficient amount of arguments']
  }

  if (sourcePID === targetPID) {
    return [false, 'Liquid.Process.monitor Self-monitor does nothing']
  }

  const targetPInfo = getPInfo(targetPID)
  if (!targetPInfo) {
    return [false, 'Liquid.Process.link Observer is already dead process']
  }

  const sourcePInfo = getPInfo(sourcePID)
  if (!sourcePInfo) {
    return [false, 'Liquid.Process.link Observed is already dead process']
  }

  if (!ifLinkExists(monitorLinks, sourcePInfo, targetPInfo)) {
    monitorLinks.push([sourcePInfo, targetPInfo, sourcePID, targetPID])
    ProcessInfo.resolution(sourcePInfo).then(([exitCode, exitReason]) => {
      splice(
        monitorLinks,
        ([pInfo]) => pInfo === sourcePInfo
      ).forEach(
        ([,, sourcePID, targetPID]) =>
          Kernel.send(targetPID, [exitCode, sourcePID, exitReason])
      )
    })
    return [true, 'exists']
  }

  return [true, 'new']
}

export function demonitor (sourcePID, targetPID) {
  if (!sourcePID || !targetPID) {
    return [false, 'Liquid.Process.demonitor Insufficient amount of arguments']
  }
  const targetPInfo = getPInfo(targetPID)
  const sourcePInfo = getPInfo(sourcePID)
  if (!sourcePInfo) {
    return [false, 'Liquid.Process.demonitor observed process is already dead']
  }
  if (!targetPInfo) {
    return [false, 'Liquid.Process.demonitor observer process is already dead']
  }
  return removeLink(monitorLinks, sourcePInfo, targetPInfo)
}


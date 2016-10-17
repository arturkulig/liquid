import ProcessInfo from './ProcessInfo'
import {debugConsole} from './Console'
import {
  removeLink,
  ifLinkExists,
  splice,
  getPInfo
} from './Process.utils.js'

const terminateLinks = []

export function link (sourcePID, targetPID) {
  if (!sourcePID || !targetPID) {
    return [false, 'Liquid.Process.link Insufficient amount of arguments']
  }

  if (sourcePID === targetPID) {
    return [false, 'Liquid.Process.link Self-link does nothing']
  }

  const targetPInfo = getPInfo(targetPID)
  if (!targetPInfo) {
    return [false, 'Liquid.Process.link Target is already dead process']
  }

  const sourcePInfo = getPInfo(sourcePID)
  if (!sourcePInfo) {
    return [false, 'Liquid.Process.link Source is already dead process']
  }

  if (!ifLinkExists(terminateLinks, sourcePInfo, targetPInfo)) {
    terminateLinks.push([sourcePInfo, targetPInfo])

    debugConsole.log('Link new link', sourcePInfo.toJSON(), targetPInfo.toJSON())
    debugConsole.log('current links', terminateLinks.map(JSON.stringify))

    ProcessInfo.resolution(sourcePInfo).then(([exitCode, exitResult]) => {
      splice(
        terminateLinks,
        ([pInfo]) => pInfo === sourcePInfo
      ).forEach(
        ([, targetPInfo]) => ProcessInfo.raiseExit(targetPInfo, [exitCode, exitResult])
      )
    })

    return [true, 'ok', 'new']
  }

  debugConsole.log('Link exists', sourcePInfo, targetPInfo)

  return [true, 'ok', 'exists']
}

export function unlink (sourcePID, targetPID) {
  if (!sourcePID || !targetPID) {
    return [false, 'Liquid.Process.unlink Insufficient amount of arguments']
  }

  return removeLink(terminateLinks, getPInfo(sourcePID), getPInfo(targetPID))
}


import * as Kernel from './Kernel'
import * as ProcessList from './ProcessList'
import ProcessInfo from './ProcessInfo'

export {
  isAlive,
  link,
  unlink,
  monitor,
  demonitor,
  end
}

const terminateLinks = []
const monitorLinks = []

function isAlive (pId) {
  return !!getPInfo(pId)
}

function link (sourcePID, targetPID) {
  if (!sourcePID || !targetPID) {
    return [false, 'Liquid.Process.link Insufficient amount of arguments']
  }

  if (sourcePID === targetPID) {
    return [false, 'Liquid.Process.link Self-link does nothing']
  }

  const targetPInfo = getPInfo(targetPID)
  if (!targetPInfo) {
    return [false, 'Luquid.Process.link Target is already dead process']
  }

  const sourcePInfo = getPInfo(sourcePID)
  if (!sourcePInfo) {
    return [false, 'Luquid.Process.link Source is already dead process']
  }

  if (!ifLinkExists(terminateLinks, sourcePInfo, targetPInfo)) {
    terminateLinks.push([sourcePInfo, targetPInfo])
    console.log('Link new link', sourcePInfo.toJSON(), targetPInfo.toJSON())
    console.log('current links', terminateLinks.map(JSON.stringify))
    ProcessInfo.pushExitHandler(sourcePInfo, executeLinkExit)
    ProcessInfo.pushErrorHandler(sourcePInfo, executeLinkError)

    return [true, 'ok', 'new']
  }

  console.log('Link exists', sourcePInfo, targetPInfo)

  return [true, 'ok', 'exists']
}

function executeLinkExit (outcome, pInfo) {
  const links = splice(
    terminateLinks,
    ([sourcePInfo]) => pInfo === sourcePInfo
  )
  console.log('executeLinkExit PID', pInfo.pid)
  links.forEach(
    ([, targetPInfo]) => {
      console.log('executeLinkExit Exit@', targetPInfo.pid)
      ProcessInfo.raiseExit(targetPInfo, outcome)
    }
  )
}

function executeLinkError (outcome, pInfo) {
  const links = splice(
    terminateLinks,
    ([sourcePInfo]) => pInfo === sourcePInfo
  )
  console.log('executeLinkExit PID', pInfo.pid)
  links.forEach(
    ([, targetPInfo]) => {
      console.log('executeLinkExit Exit@', targetPInfo.pid)
      ProcessInfo.raiseError(targetPInfo, outcome)
    }
  )
}

function unlink (sourcePID, targetPID) {
  if (!sourcePID || !targetPID) {
    return [false, 'Liquid.Process.unlink Insufficient amount of arguments']
  }

  return removeLink(terminateLinks, getPInfo(sourcePID), getPInfo(targetPID))
}

function monitor (sourcePID, targetPID) {
  if (!sourcePID || !targetPID) {
    return [false, 'Liquid.Process.monitor Insufficient amount of arguments']
  }

  if (sourcePID === targetPID) {
    return [false, 'Liquid.Process.monitor Self-monitor does nothing']
  }

  const targetPInfo = getPInfo(targetPID)
  if (!targetPInfo) {
    return [false, 'Luquid.Process.link Observer is already dead process']
  }

  const sourcePInfo = getPInfo(sourcePID)

  if (sourcePInfo) {
    if (!ifLinkExists(monitorLinks, sourcePInfo, targetPInfo)) {
      monitorLinks.push([sourcePInfo, targetPInfo, sourcePID, targetPID])
      ProcessInfo.pushExitHandler(sourcePInfo, executeExitMonitoring)
      ProcessInfo.pushErrorHandler(sourcePInfo, executeErrorMonitoring)
    }
  } else {
    Kernel.send(targetPID, ['exit', sourcePID])
  }

  return [true]
}

function executeExitMonitoring (outcome, sourcePInfo) {
  executeMonitoring('exit', outcome, sourcePInfo)
}

function executeErrorMonitoring (outcome, sourcePInfo) {
  executeMonitoring('error', outcome, sourcePInfo)
}

function executeMonitoring (reason, outcome, sourcePInfo) {
  splice(
    monitorLinks,
    ([pInfo]) => pInfo === sourcePInfo
  ).forEach(
    ([,, sourcePID, targetPID]) =>
      Kernel.send(targetPID, [reason, sourcePID, outcome])
  )
}

function demonitor (sourcePID, targetPID) {
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

function removeLink (links, source, target) {
  if (!links || !source || !target) {
    return [false, 'Liquid.Process.removeLink Insufficient amount of arguments']
  }

  const linkPosition = findLink(links, source, target)

  if (linkPosition === -1) {
    return [true, 'none']
  }

  links.splice(linkPosition, 1)

  return [true, 'ok']
}

function ifLinkExists (links, questionedSource, questionedTarget) {
  return findLink(links, questionedSource, questionedTarget) >= 0
}

function findLink (links, source, target) {
  let i = -1
  for (let [linkSource, linkTarget] of links) {
    i++
    if (
      source === linkSource &&
      target === linkTarget
    ) {
      return i
    }
  }
  return -1
}

function splice (collection, comparator) {
  let i = -1
  let result = []
  for (let item of collection) {
    i++
    if (comparator(item)) {
      result.push(item)
      collection.splice(i, 1)
      i--
    }
  }
  return result
}

function end (ref) {
  const pInfo = getPInfo(ref)
  if (!pInfo) {
    return ['exit', ref]
  }
  return new Promise(resolve => {
    ProcessInfo.pushExitHandler(pInfo, result => resolve(['exit', ref, result]))
    ProcessInfo.pushErrorHandler(pInfo, reason => resolve(['error', ref, reason]))
  })
}

function getPInfo (pId) {
  const pInfo = ProcessList.getByRef(pId)
  if (!pInfo) return
  if (!ProcessInfo.isAlive(pInfo)) return
  return pInfo
}

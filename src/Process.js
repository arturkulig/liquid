import * as Kernel from './Kernel'
import * as ProcessList from './ProcessList'
import ProcessInfo from './ProcessInfo'

export {
  isAlive,
  link,
  monitor,
  end
}

function isAlive (pId) {
  return !!getPInfo(pId)
}

function link (sourcePid, targetPid) {
  if (!sourcePid || !targetPid) {
    return [false, 'Liquid.Process.link Insufficient amount of arguments']
  }

  if (sourcePid === targetPid) {
    return [false, 'Liquid.Process.link Self-link does nothing']
  }

  const target = getPInfo(targetPid)
  if (!target) {
    return [false, 'Luquid.Process.link Target is already dead process']
  }

  const source = getPInfo(sourcePid)
  if (!source) {
    return [false, 'Luquid.Process.link Source is already dead process']
  }

  ProcessInfo.pushExitHandler(
    source,
    outcome => ProcessInfo.raiseExit(target, outcome)
  )

  ProcessInfo.pushErrorHandler(
    source,
    outcome => ProcessInfo.raiseError(target, outcome)
  )

  return [true, 'ok']
}

function monitor (observedPid, observerPid) {
  if (!observedPid || !observerPid) {
    return [false, 'Liquid.Process.monitor Insufficient amount of arguments']
  }

  if (observedPid === observerPid) {
    return [false, 'Liquid.Process.monitor Self-monitor does nothing']
  }

  const observer = getPInfo(observerPid)
  if (!observer) {
    return [false, 'Luquid.Process.link Observer is already dead process']
  }

  const observed = getPInfo(observedPid)

  if (observed) {
    ProcessInfo.pushExitHandler(
      observed,
      result => { Kernel.send(observerPid, ['exit', observedPid, result]) }
    )

    ProcessInfo.pushErrorHandler(
      observed,
      reason => { Kernel.send(observerPid, ['error', observedPid, reason]) }
    )
  } else {
    Kernel.send(observerPid, ['exit', observedPid])
  }

  return [true]
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

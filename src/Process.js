import * as ProcessList from './ProcessList'
import ProcessInfo from './ProcessInfo'
import {
  getPInfo
} from './Process.utils.js'
import {
  link,
  unlink
} from './Process.link.js'
import {
  monitor,
  demonitor
} from './Process.monitor.js'

export {
  isAlive,
  link,
  unlink,
  monitor,
  demonitor,
  endOf,
  exit
}

function isAlive (pid) {
  return !!getPInfo(pid)
}

function exit (pid, reason = 'shutdown') {
  const pInfo = getPInfo(pid)
  if (!pInfo) return Promise.resolve(false)

  switch (reason) {
    case 'shutdown': {
      ProcessInfo.raiseExit(pInfo)
      break
    }
    case 'error': {
      ProcessInfo.raiseError(pInfo)
      break
    }
    default: {
      return Promise.resolve(false)
    }
  }
  return ProcessInfo.resolution(pInfo)
    .then(() => true)
}

function endOf (pid) {
  if (!pid) {
    return [null]
  }

  const pInfo = ProcessList.getByRef(pid)
  if (!pInfo) {
    return [null, pid]
  }

  return ProcessInfo.resolution(pInfo)
    .then(([code, result]) => [code, pid, result])
}


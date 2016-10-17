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

async function exit (pid, reason = 'shutdown') {
  const pInfo = getPInfo(pid)
  if (!pInfo) return false

  switch (reason) {
    case 'shutdown': {
      await ProcessInfo.raiseExit(pInfo)
      break
    }
    case 'error': {
      await ProcessInfo.raiseError(pInfo)
      break
    }
    default: {
      return false
    }
  }
  await ProcessInfo.resolution(pInfo)
  return true
}

async function endOf (pid) {
  if (!pid) {
    return [null]
  }

  const pInfo = ProcessList.getByRef(pid)
  if (!pInfo) {
    return [null, pid]
  }

  const [code, result] = await ProcessInfo.resolution(pInfo)
  return [code, pid, result]
}


import {send} from './Kernel'
import * as Process from './Process'
import {externalConsole} from './Console'
import Pid from './Pid'

export async function exitGracefully (svPID, childrenRunning) {
  while (childrenRunning.length > 0) {
    await Process.exit(childrenRunning.splice(0, 1)[0])
  }
  await Process.endOf(svPID)
}

export async function runFormula (formula) {
  if (typeof formula === 'object') {
    return await runModule(formula)
  }
  if (typeof formula === 'function') {
    return await runFunction(formula)
  }
  externalConsole.error(
    'Liquid.Supervisor.start Provided formula is unrunnable.',
    formula,
    'Provide either () => [boolean, pid] or { start: () => [boolean, pid]'
  )
  return [false]
}

export async function runModule (formula) {
  return await runFunction(formula.start)
}

export async function runFunction (formula) {
  try {
    const result = await formula()
    if (Pid.isPid(result)) {
      return [true, result]
    }
    if (result instanceof Array && result.length === 2) {
      const [ok] = result
      if (!ok) {
        externalConsole.error(
          formula.name || formula,
          result[1]
        )
      }
      return result
    }
  } catch (e) {
    return [false, e.stack || e.message || e]
  }
  const errorMsg = [
    'Liquid.Supervisor.start',
    'Unable to establish if supervisor actually run formula that spawned a process',
    '\nReturn PID or [true, PID] or [false, \'error\']'
  ].join('')
  externalConsole.error(errorMsg, formula)
  return [false, errorMsg, formula]
}

export async function startLinkAll (childrenFormulas, supervisor) {
  const childrenRunning = await Promise.all(childrenFormulas.map(runFormula))
  return childrenRunning.map(([runOK, pid]) => {
    if (!runOK) {
      const fakePid = {}
      send(supervisor, ['error', fakePid])
      return fakePid
    }
    const [linkOK] = Process.monitor(pid, supervisor)
    if (!linkOK) {
      send(supervisor, ['error', pid])
    }
    return pid
  })
}

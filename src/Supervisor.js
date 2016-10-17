import {send} from './Kernel'
import {externalConsole} from './Console'
import * as strategies from './Supervisor.strategies'

export async function start (childrenFormulas = [], {name, strategy = 'one_for_one'} = {}) {
  if (strategy in strategies) {
    return strategies[strategy](childrenFormulas, name)
  }
  return [false, `Liquid.Supervisor.start Incorrect strategy ${strategy}`]
}

const reasons = ['normal', 'error']

export async function stop (pid, reason = 'normal') {
  if (reasons.indexOf(reason) === -1) {
    const errorMsg = 'Liquid.Supervisor.stop Incorrect reason'
    externalConsole.error(errorMsg)
    return [false, errorMsg]
  }
  return await send(pid, [`supervisor_${reason}`])
}

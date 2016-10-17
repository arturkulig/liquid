import {send, spawn} from './Kernel'

export function start (name) {
  const [ok, pid] = spawn(async receive => {
    const handlers = []

    while (true) {
      const [cmd, ...args] = await receive()
      switch (cmd) {
        case 'addHandler': {
          const [handler] = args
          handlers.push(handler)
          break
        }
        case 'removeHandler': {
          const [handler] = args
          handlers.splice(
            handlers.indexOf(handler),
            1
          )
          break
        }
        case 'notify': {
          const [event] = args
          await Promise.all(
            handlers.map(
              handler => handler(event)
            )
          )
        }
      }
    }
  }, name)

  if (!ok) {
    return [false, pid]
  }

  return [true, pid]
}

export function addHandler (pid, handler) {
  return send(pid, ['addHandler', handler])
}

export function removeHandler (pid, handler) {
  return send(pid, ['removeHandler', handler])
}

export function notify (pid, event) {
  return send(pid, ['notify', event])
}

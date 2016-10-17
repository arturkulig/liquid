import {
  GenServer,
  Process
} from './index'

/* globals describe, it, expect */

describe('GenServer', () => {
  it('starts', () => {
    const [ok, pid] = GenServer.start({})
    expect(ok).toBe(true)
    expect(pid).toBeDefined()
  })

  it('serves with sync functions', async () => {
    const [ok, pid] = GenServer.start(
      (payload, state = 0) => {
        return [payload + state, payload]
      }
    )
    expect({ok}).toEqual({ok: true})

    const [replyOk, reply] = await GenServer.call(pid, 1)
    expect({replyOk, reply}).toEqual({replyOk: true, reply: 1})

    const [replyOk2, reply2] = await GenServer.call(pid, 1)
    expect({replyOk2, reply2}).toEqual({replyOk2: true, reply2: 2})

    const [replyOk3, reply3] = await GenServer.call(pid, 1)
    expect({replyOk3, reply3}).toEqual({replyOk3: true, reply3: 2})

    const [replyOk4, reply4] = await GenServer.call(pid, 3)
    expect({replyOk4, reply4}).toEqual({replyOk4: true, reply4: 4})
  })

  it('serves with async functions', async () => {
    const [ok, pid] = GenServer.start(
      async (payload, state = 0) => {
        const safePayload = await payload
        return [safePayload + state, safePayload]
      }
    )
    expect({ok}).toEqual({ok: true})

    const [replyOk, reply] = await GenServer.call(pid, Promise.resolve(1))
    expect({replyOk, reply}).toEqual({replyOk: true, reply: 1})

    const [replyOk2, reply2] = await GenServer.call(pid, 1)
    expect({replyOk2, reply2}).toEqual({replyOk2: true, reply2: 2})
  })

  it('ignores handlers errors', async () => {
    const [ok, pid] = GenServer.start(
      async () => {
        throw new Error()
      }
    )
    expect({ok}).toEqual({ok: true})

    const [ok2, desc, error] = await GenServer.call(pid, Promise.resolve(1))
    expect({ok2}).toEqual({ok2: false})
    expect({desc}).toEqual({desc: 'Liquid.GenServer handler committed an error'})
    expect({errorType: error instanceof Error}).toEqual({errorType: true})
  })

  it('handles stop call', async () => {
    const [ok, pid] = GenServer.start(
      async receive => {
        await receive()
      }
    )
    expect({ok}).toEqual({ok: true})

    const [ok2] = await GenServer.stop(pid)
    expect({ok2}).toEqual({ok2: true})

    const isAlive = Process.isAlive(pid)
    expect({isAlive}).toEqual({isAlive: false})
  })
})

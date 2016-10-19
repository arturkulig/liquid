import {
  spawn,
  send,
  timeout,
  Supervisor,
  Pid
} from './index'

/* globals describe, expect, it */

describe('Supervisor', () => {
  it('start with one_for_all', async () => {
    let i = 0
    let p1started = 0
    let p2started = 0

    const [ok, sv] = await Supervisor.start(
      [
        () => spawn(async (receive) => {
          ++p1started
          const received = await receive()
          i += received
          throw new Error()
        }, 'B@o_1'),

        () => spawn(async (receive) => {
          ++p2started
          const received = await receive()
          i += received
          throw new Error()
        }, 'B@o_2')
      ],
      {strategy: 'one_for_all'}
    )

    expect({ok}).toEqual({ok: true})
    expect({i}).toEqual({i: 0})
    expect({isSVPid: Pid.isPid(sv)}).toEqual({isSVPid: true})

    await timeout(10)
    expect({p1started}).toEqual({p1started: 1})
    expect({p2started}).toEqual({p2started: 1})

    const [ok1] = await send('B@o_1', 2)
    expect({ok1}).toEqual({ok1: true})

    await timeout(10)
    expect({p1started}).toEqual({p1started: 2})
    expect({p2started}).toEqual({p2started: 2})

    const [ok2] = await send('B@o_2', 3)
    expect({ok2}).toEqual({ok2: true})

    await timeout(10)
    expect({p1started}).toEqual({p1started: 3})
    expect({p2started}).toEqual({p2started: 3})

    const [ok3] = await send('B@o_1', 1)
    expect({ok3}).toEqual({ok3: true})

    await timeout(10)

    expect({i2: i}).toEqual({i2: 6})
    expect({p1started}).toEqual({p1started: 4})
    expect({p2started}).toEqual({p2started: 4})
  })

  it('stops with one_for_all', async () => {
    let i = 0
    const [ok, sv] = await Supervisor.start([
      () => spawn(async receive => {
        const r = await receive()
        i += r
      }, 'B@o_4')
    ])

    expect({ok}).toEqual({ok: true})
    expect({isPid: Pid.isPid(sv)}).toEqual({isPid: true})

    const [sendOK, sendDets] = await send('B@o_4', 2)
    expect({sendOK, sendDets}).toEqual({sendOK: true, sendDets: 'ok'})
    expect({i1: i}).toEqual({i1: 2})

    await Supervisor.stop(sv)

    const [sendOK3] = await send('B@o_4', 2)
    expect({sendOK3}).toEqual({sendOK3: false})
    expect({i3: i}).toEqual({i3: 2})
  })
})

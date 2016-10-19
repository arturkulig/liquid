import {
  spawn,
  send,
  timeout,
  Supervisor,
  Pid
} from './index'

/* globals describe, expect, it */

describe('Supervisor', () => {
  it('start with many one_for_rest', async () => {
    let i = 0
    let p1started = 0
    let p2started = 0
    let p3started = 0

    const [ok, sv] = await Supervisor.start(
      [
        () => spawn(async (receive) => {
          ++p1started
          const received = await receive()
          i += received
        }, 'C@o_1'),

        () => spawn(async (receive) => {
          ++p2started
          const received = await receive()
          i += received
        }, 'C@o_2'),

        () => spawn(async (receive) => {
          ++p3started
          const received = await receive()
          i += received
        }, 'C@o_3')
      ],
      {strategy: 'one_for_rest'}
    )

    expect({ok}).toEqual({ok: true})
    expect({i}).toEqual({i: 0})
    expect({isSVPid: Pid.isPid(sv)}).toEqual({isSVPid: true})

    await timeout(10)
    expect({p1started}).toEqual({p1started: 1})
    expect({p2started}).toEqual({p2started: 1})
    expect({p3started}).toEqual({p3started: 1})

    const [ok1] = await send('C@o_1', 2)
    expect({ok1}).toEqual({ok1: true})

    await timeout(10)
    expect({p1started}).toEqual({p1started: 2})
    expect({p2started}).toEqual({p2started: 2})
    expect({p3started}).toEqual({p3started: 2})

    const [ok2] = await send('C@o_2', 3)
    expect({ok2}).toEqual({ok2: true})

    await timeout(10)
    expect({p1started}).toEqual({p1started: 2})
    expect({p2started}).toEqual({p2started: 3})
    expect({p3started}).toEqual({p3started: 3})

    const [ok3] = await send('C@o_3', 1)
    expect({ok3}).toEqual({ok3: true})

    await timeout(10)

    expect({i2: i}).toEqual({i2: 6})
    expect({p1started}).toEqual({p1started: 2})
    expect({p2started}).toEqual({p2started: 3})
    expect({p3started}).toEqual({p3started: 4})
  })

  it('stops one_for_rest', async () => {
    let i = 0

    const [, sv] = await Supervisor.start([
      () => spawn(async (receive) => {
        await receive()
        i++
      }, 'C@o_4')
    ])

    await send('C@o_4')
    await timeout()
    await send('C@o_4')
    await timeout()
    expect({i1: i}).toEqual({i1: 2})

    await Supervisor.stop(sv)

    const [sendOK] = await send('C@o_4')
    expect({sendOK}).toEqual({sendOK})
    expect({i2: i}).toEqual({i2: 2})
  })
})

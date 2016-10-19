import {
  spawn,
  send,
  timeout,
  Supervisor,
  Pid
} from './index'

/* globals describe, expect, it */

describe('Supervisor', () => {
  it('start with many one_for_one', async () => {
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
        }, 'A@o_1'),

        () => spawn(async (receive) => {
          ++p2started
          const received = await receive()
          i += received
          throw new Error()
        }, 'A@o_2')
      ],
      {strategy: 'one_for_one'}
    )

    expect({ok}).toEqual({ok: true})
    expect({i}).toEqual({i: 0})
    expect({isSVPid: Pid.isPid(sv)}).toEqual({isSVPid: true})

    const [ok1, msg1] = await send('A@o_1', 2)
    expect({ok1, msg1}).toEqual({ok1: true, msg1: 'ok'})
    await timeout(10)

    const [ok2, msg2] = await send('A@o_2', 3)
    expect({ok2, msg2}).toEqual({ok2: true, msg2: 'ok'})
    await timeout(10)

    const [ok3, msg3] = await send('A@o_1', 1)
    expect({ok3, msg3}).toEqual({ok3: true, msg3: 'ok'})
    await timeout(10)

    await timeout(10)

    expect({i2: i}).toEqual({i2: 6})
    expect({p1started}).toEqual({p1started: 3})
    expect({p2started}).toEqual({p2started: 2})
  })

  it('stop when one_for_one', async () => {
    let i = 0
    const [ok, sv] = await Supervisor.start([
      () => spawn(async (receive) => {
        await receive()
        i++
      }, 'stop_one_for_one')
    ], {strategy: 'one_for_one'})
    expect({ok}).toEqual({ok: true})
    expect({isPid: Pid.isPid(sv)}).toEqual({isPid: true})

    await send('stop_one_for_one')
    await timeout(10)
    expect({i}).toEqual({i: 1})

    await send('stop_one_for_one')
    await timeout(10)
    expect({i2: i}).toEqual({i2: 2})

    await Supervisor.stop(sv)

    await send('stop_one_for_one')
    expect({i3: i}).toEqual({i3: 2})
  })
})

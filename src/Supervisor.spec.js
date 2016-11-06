import {
  spawn,
  send,
  Process,
  Supervisor,
  Pid
} from './index'

/* globals describe, expect, it */

describe('Supervisor', () => {
  it('starts ', async () => {
    const [ok, sv] = await Supervisor.start([])
    expect({isAlive: Process.isAlive(sv)}).toEqual({isAlive: true})
    expect({ok}).toEqual({ok: true})
  })

  it('starts named', async () => {
    const [ok] = await Supervisor.start([], {name: 'uniqSVNamedTest'})
    expect({isAlive: Process.isAlive('uniqSVNamedTest')}).toEqual({isAlive: true})
    expect({ok}).toEqual({ok: true})
  })

  it('starts with function children', async () => {
    let i = 0

    const [ok, sv] = await Supervisor.start(
      [
        () => spawn(async (receive) => {
          const received = await receive()
          i += received
        }, 'starts with function children')
      ],
      {strategy: 'one_for_one'}
    )

    expect({ok}).toEqual({ok: true})
    expect({i}).toEqual({i: 0})
    expect({isSVPid: Pid.isPid(sv)}).toEqual({isSVPid: true})

    const [send1OK, send1Msg] = await send('starts with function children', 2)
    expect({send1Msg}).toEqual({send1Msg: 'ok'})
    expect({send1OK}).toEqual({send1OK: true})
    expect({i}).toEqual({i: 2})
  })

  it('starts with module children', async () => {
    let i = 0

    const [ok, sv] = await Supervisor.start(
      [
        {
          start () {
            return spawn(async(receive) => {
              i += await receive()
              throw new Error()
            }, 'starts with module children')
          }
        }
      ],
      {strategy: 'one_for_one'}
    )

    expect({ok}).toEqual({ok: true})
    expect({i}).toEqual({i: 0})
    expect({isSVPid: Pid.isPid(sv)}).toEqual({isSVPid: true})

    await send('starts with module children', 2)
    expect({i}).toEqual({i: 2})
  })

  it('counts', async () => {
    throw new Error('Not Implemented')
  })
})

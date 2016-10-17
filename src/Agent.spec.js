import * as Agent from './Agent'
import * as Process from './Process'
import Pid from './Pid'

/* globals describe, it, expect */

describe('Agent', () => {
  it('starts', () => {
    const [ok, pid] = Agent.start()
    expect({ok}).toEqual({ok: true})
    expect({isPid: Pid.isPid(pid)}).toEqual({isPid: true})
    expect({isPidAlive: Process.isAlive(pid)}).toEqual({isPidAlive: true})
  })

  it('starts named', () => {
    const [ok] = Agent.start('absolutely uniq name for an agent and with spaces too!')
    expect({ok}).toEqual({ok: true})
    expect({isNameAlive: Process.isAlive('absolutely uniq name for an agent and with spaces too!')}).toEqual({isNameAlive: true})
  })

  it('allows getting', async () => {
    const [ok, pid] = Agent.start()
    expect({ok}).toEqual({ok: true})

    const [ok2, reply] = await Agent.get(pid, (state = 0) => state + 2)
    expect({ok2}).toEqual({ok2: true})
    expect({reply}).toEqual({reply: 2})

    const [ok3, reply2] = await Agent.get(pid, (state = 0) => state + 2)
    expect({ok3}).toEqual({ok3: true})
    expect({reply2}).toEqual({reply2: 2})
  })

  it('allows updateing', async () => {
    const [ok, pid] = Agent.start()
    expect({ok}).toEqual({ok: true})

    const [ok2, reply] = await Agent.update(pid, (state = 0) => state + 2)
    expect({ok2}).toEqual({ok2: true})
    expect({reply}).toEqual({reply: 2})

    const [ok3, reply2] = await Agent.update(pid, (state = 0) => state + 2)
    expect({ok3}).toEqual({ok3: true})
    expect({reply2}).toEqual({reply2: 4})
  })

  it('allows getting and updating', async () => {
    const [ok, pid] = Agent.start()
    expect({ok}).toEqual({ok: true})

    const [ok2, reply] = await Agent.getAndUpdate(pid, (state = 0) => [state, state + 2])
    expect({ok2}).toEqual({ok2: true})
    expect({reply}).toEqual({reply: 0})

    const [ok3, reply2] = await Agent.getAndUpdate(pid, (state = 0) => [state, state + 2])
    expect({ok3}).toEqual({ok3: true})
    expect({reply2}).toEqual({reply2: 2})
  })
})

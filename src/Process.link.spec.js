import {
  spawn,
  send,
  Process
} from '../src'

/* globals describe, it, expect */

describe('Process', () => {
  describe('link stops linked process from receiving messages', () => {
    it('single, after exit', async () => {
      let sourceReceivingTimes = 0
      let targetReceivingTimes = 0
      let targetErrorRaised = 0

      const [breakerOK, breakerPID] = spawn(async receive => {
        await receive()
        sourceReceivingTimes++
      })
      const [brokenOK, brokenPID] = spawn(async receive => {
        try {
          await receive() // handing
        } catch (e) {
          targetErrorRaised++
        }
        try {
          await receive() // occuring after death
        } catch (e) {
          targetErrorRaised++
          throw e
        }
      })

      expect(breakerOK && brokenOK).toBe(true)
      const [linked, linkStatus, linkStatusDetail] = Process.link(breakerPID, brokenPID)
      expect(linked).toBe(true)
      expect(linkStatus).toBe('ok')
      expect(linkStatusDetail).toBe('new')

      await timeout()

      const [breakerReceived] = await send(breakerPID)
      expect(breakerReceived).toBe(true)

      const [brokenReceived] = await send(brokenPID)
      expect(brokenReceived).toBe(false)
      expect(sourceReceivingTimes).toBe(1)
      expect(targetReceivingTimes).toBe(0)
      expect(targetErrorRaised).toBe(2)
    })

    it('single, after an error', async () => {
      let receivings = 0

      const [breakerOK, breakerPID] = spawn(async () => {
        throw new Error()
      })
      const [brokenOK, brokenPID] = spawn(async receive => {
        await receive()
        receivings++
      })

      expect(breakerOK && brokenOK).toBe(true)

      const [linked] = Process.link(breakerPID, brokenPID)
      expect({linked}).toEqual({linked: true})

      await timeout()

      const [brokenReceived] = await send(brokenPID)
      expect(brokenReceived).toBe(false)
      expect(receivings).toBe(0)
    })

    it('many, in cascade manner', async () => {
      const pids = []
      for (let i = 0; i < 3; i++) {
        const [ok, pid] = spawn(async receive => {
          await receive()
        })
        expect(ok).toBe(true)
        expect(pid).toBeDefined()
        pids.push(pid)
        if (i > 0) {
          const [linked] = Process.link(pids[pids.length - 2], pids[pids.length - 1])
          expect({linked}).toEqual({linked: true})
        }
      }
      pids.forEach(pid => expect(Process.isAlive(pid)).toBe(true))
      await timeout()
      await send(pids[0])
      await timeout()
      pids.forEach(pid => expect(Process.isAlive(pid)).toBe(false))
    })
  })

  it('can unlink processes after linking them', async () => {
    const [sourceOK, sourcePID] = spawn(async receive => { await receive() })
    const [targetOK, targetPID] = spawn(async receive => { await receive() })
    expect({sourceOK}).toEqual({sourceOK: true})
    expect({targetOK}).toEqual({targetOK: true})

    const [linked] = Process.link(sourcePID, targetPID)
    expect(linked).toEqual(true)

    expect({sourceAlive: Process.isAlive(sourcePID)}).toEqual({sourceAlive: true})
    expect({targetAlive: Process.isAlive(targetPID)}).toEqual({targetAlive: true})

    const [unlinked, unlinkedMsg] = Process.unlink(sourcePID, targetPID)
    expect({unlinked, unlinkedMsg}).toEqual({unlinked: true, unlinkedMsg: 'ok'})

    send(sourcePID)
    await timeout()

    expect({targetAlive2: Process.isAlive(targetPID)}).toEqual({targetAlive2: true})
  })
})

async function timeout (interval = 0) {
  await new Promise(resolve => setTimeout(resolve, interval))
}


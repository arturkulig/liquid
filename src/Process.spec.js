import {
  spawn,
  send,
  Process
} from '../src'

/* globals describe, it, expect */

describe('Process', () => {
  describe('isAlive', () => {
    it('checks that process is alive', () => {
      const [ps, pid] = spawn(async receive => { await receive() })
      expect(ps).toBe(true)
      expect(pid).toBeDefined()
      expect(Process.isAlive(pid)).toBe(true)
      send(pid)
    })

    it('checks that named process is not yet alive', () => {
      expect(Process.isAlive('testProc')).toBe(false)
    })

    it('checks that named process is alive', () => {
      const [ps, pid] = spawn(async receive => { await receive() }, 'testProc')
      expect(ps).toBe(true)
      expect(pid).toBeDefined()
      expect(Process.isAlive('testProc')).toBe(true)
    })

    it('checks that process is gone', () => new Promise(async resolve => {
      const [ps, pid] = spawn(() => {})
      await timeout(0)
      expect(ps).toBe(true)
      expect(pid).toBeDefined()
      expect(Process.isAlive(pid)).toBe(false)
      resolve()
    }))

    it('can do self-diagnose', () => new Promise(resolve => {
      spawn((receive, pid) => {
        expect(Process.isAlive(pid)).toBe(true)
        resolve()
      })
    }))
  })

  describe('end', () => {
    it('handles dead processes, but doesn\'t capture result', async () => {
      const proof = {}
      const [, pid] = spawn(() => proof)
      await new Promise(resolve => setTimeout(resolve, 10))
      const [termCode, termPID, termReason] = await Process.end(pid)
      expect(termCode).toBe('exit')
      expect(termPID).toBe(pid)
      expect(termReason).not.toBeDefined()
    })

    it('handles live processes', async () => {
      const proof = {}
      const [, pid] = spawn(async receive => {
        await timeout()
        await receive()
        return proof
      })
      setTimeout(() => send(pid), 10)
      const [termCode, termPID, termResult] = await Process.end(pid)
      expect(termCode).toBe('exit')
      expect(termPID).toBe(pid)
      expect(termResult).toBe(proof)
    })
  })

  describe('monitor', () => {
    it('handles self-monitor, but does nothing', () => new Promise(resolve => {
      spawn(async (receive, self) => {
        const [ok] = Process.monitor(self, self)
        expect(ok).toBe(false)
        resolve()
      })
    }))

    it('handles already dead processes', () => new Promise((resolve, reject) => {
      const [, deadPID] = spawn(() => {})

      spawn(async (receive, monitorPID) => {
        const [ok] = Process.monitor(deadPID, monitorPID)
        expect(ok).toBe(true)
        const [termCode, termPID, termResult] = await receive()
        try {
          expect(termCode).toBe('exit')
          expect(termPID).toBe(deadPID)
          expect(termResult).not.toBeDefined()
        } catch (e) {
          reject(e)
        }
        resolve()
      })
    }))

    it('handles living processes and captures result', () => new Promise(resolve => {
      const [, srcPID] = spawn(async receive => {
        return await receive()
      })

      spawn(async (receive, monitorPID) => {
        const [ok] = Process.monitor(srcPID, monitorPID)
        expect(ok).toBe(true)

        const result = {}
        send(srcPID, result)

        const [termCode, termPID, termResult] = await receive()
        expect(termCode).toBe('exit')
        expect(termPID).toBe(srcPID)
        expect(termResult).toBe(result)

        resolve()
      })
    }))
  })

  describe('link stops linked process from receiving messages', () => {
    it('after exit', async () => {
      let receivings = 0

      const [breakerOK, breakerPID] = spawn(async receive => {
        await receive()
        console.log('- #1 received')
        receivings++
      })
      const [brokenOK, brokenPID] = spawn(async receive => {
        await receive()
        console.log('- #2 received')
        receivings++
        await receive()
      })

      await timeout()

      // console.log('breakerOK && brokenOK', breakerOK && brokenOK)
      expect(breakerOK && brokenOK).toBe(true)

      Process.link(breakerPID, brokenPID)

      const [breakerReceived] = await send(breakerPID)
      // console.log('breakerReceived', breakerReceived)
      expect(breakerReceived).toBe(true)

      const [brokenReceived] = await send(brokenPID)
      // console.log('brokenReceived', brokenReceived)
      expect(brokenReceived).toBe(false)
      // console.log('receivings', receivings)
      expect(receivings).toBe(1)
    })
  })
})

async function timeout (interval = 0) {
  await new Promise(resolve => setTimeout(resolve, interval))
}


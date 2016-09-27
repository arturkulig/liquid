import {
  spawn,
  send,
  Process
} from '../src'

/* globals describe, it, expect */

describe('Process', () => {
  describe('isAlive', () => {
    it('checks that process is alive', () => {
      const [ok, pid] = spawn(async receive => { await receive() })
      expect(ok).toBe(true)
      expect(pid).toBeDefined()
      expect(Process.isAlive(pid)).toBe(true)
      send(pid)
    })

    it('checks that named process is not yet alive', () => {
      expect(Process.isAlive('testProc')).toBe(false)
    })

    it('checks that named process is alive', () => {
      const [ok, pid] = spawn(async receive => { await receive() }, 'testProc')
      expect(ok).toBe(true)
      expect(pid).toBeDefined()
      expect(Process.isAlive('testProc')).toBe(true)
      send(pid)
    })

    it('checks that process is gone', () => new Promise(async resolve => {
      const [ok, pid] = spawn(() => {})
      await timeout(0)
      expect(ok).toBe(true)
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

      await timeout(10)

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
        try {
          const [ok] = Process.monitor(deadPID, monitorPID)
          expect(ok).toBe(true)

          const [termCode, termPID, termResult] = await receive()
          expect(termCode).toBe('exit')
          expect(termPID).toBe(deadPID)
          expect(termResult).not.toBeDefined()
        } catch (e) {
          reject(e)
        }
        resolve()
      })
    }))

    it('handles living processes and captures result', () => new Promise((resolve, reject) => {
      const [, srcPID] = spawn(async receive => {
        return await receive()
      })

      spawn(async (receive, monitorPID) => {
        try {
          const [ok] = Process.monitor(srcPID, monitorPID)
          expect(ok).toBe(true)

          const result = {}
          send(srcPID, result)

          const [termCode, termPID, termResult] = await receive()
          expect(termCode).toBe('exit')
          expect(termPID).toBe(srcPID)
          expect(termResult).toBe(result)

          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }))
  })

  describe('link stops linked process from receiving messages', () => {
    it('single, after exit', async () => {
      let receivings = 0

      const [breakerOK, breakerPID] = spawn(async receive => {
        await receive()
        receivings++
      })
      const [brokenOK, brokenPID] = spawn(async receive => {
        await receive()
        receivings++
        await receive()
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
      expect(receivings).toBe(1)
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

      console.log('breakerOK && brokenOK', breakerOK && brokenOK, true)
      expect(breakerOK && brokenOK).toBe(true)

      const [linked] = Process.link(breakerPID, brokenPID)
      expect({linked}).toEqual({linked: true})

      await timeout()

      console.log('broken sending...')
      const [brokenReceived] = await send(brokenPID)
      console.log('brokenReceived', brokenReceived, false)
      expect(brokenReceived).toBe(false)
      console.log('receivings', receivings, 0)
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

  describe('monitor informs observer about observed process end', () => {
    it('after exit', () => new Promise((resolve, reject) => {
      const proof = {proof: true}
      spawn(async (receive, monitor) => {
        const [, patient] = spawn(async () => proof)

        try {
          const [monitored] = Process.monitor(patient, monitor)
          expect({monitored}).toEqual({monitored: true})

          const [termCode, termPID, termOutcome] = await receive()
          expect({termCode, termPID, termOutcome})
            .toEqual({termCode: 'exit', termPID: patient, termOutcome: proof})

          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }))

    it('after error', () => new Promise((resolve, reject) => {
      spawn(async (receive, monitor) => {
        const [, patient] = spawn(async () => {
          throw new Error('oops!')
        })

        try {
          const [monitored] = Process.monitor(patient, monitor)
          expect({monitored}).toEqual({monitored: true})

          const [termCode, termPID, termOutcome] = await receive()
          expect({termCode, termPID, termOutcomeMessage: termOutcome.message})
            .toEqual({termCode: 'error', termPID: patient, termOutcomeMessage: 'oops!'})

          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }))
  })

  it('demonitor allows to unregister monitoring', () => new Promise((resolve, reject) => {
    spawn(async (receive, monitor) => {
      const [, patient] = spawn(async receive => {
        await receive()
      })

      try {
        const [monitored] = Process.monitor(patient, monitor)
        expect({monitored}).toEqual({monitored: true})

        await timeout(10)
        expect({patientAlive: Process.isAlive(patient)}).toEqual({patientAlive: true})
        expect({monitorAlive: Process.isAlive(monitor)}).toEqual({monitorAlive: true})

        const [demonitored, demonitoredDetail] = Process.demonitor(patient, monitor)
        expect({demonitored, demonitoredDetail})
          .toEqual({demonitored: true, demonitoredDetail: 'ok'})

        await send(patient)
        await timeout(10)

        const [kind, result] = await race({
          receive: receive(),
          timeout: timeout(10)
        })
        expect({kind}).toEqual({kind: 'timeout'})
        expect({result}).toEqual({result: undefined})

        resolve()
      } catch (e) {
        reject(e)
      }
    })
  }))
})

function race (promises) {
  return new Promise((resolve, reject) => {
    Object.keys(promises).forEach(
      key => {
        promises[key].then(
          result => resolve([key, result]),
          reason => reject([key, reason])
        )
      }
    )
  })
}

async function timeout (interval = 0) {
  await new Promise(resolve => setTimeout(resolve, interval))
}


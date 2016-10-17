import {
  spawn,
  send,
  Process
} from '../src'

/* globals describe, it, expect */

describe('Process', () => {
  describe('monitor', () => {
    it('handles self-monitor, but does nothing', () => new Promise(resolve => {
      spawn(async (receive, self) => {
        const [ok] = Process.monitor(self, self)
        expect(ok).toBe(false)
        resolve()
      })
    }))

    it('handles already dead source process', () => new Promise(async (resolve, reject) => {
      const [, deadPID] = spawn(() => {})

      await timeout(10)

      spawn(async (receive, monitorPID) => {
        try {
          const [ok] = Process.monitor(deadPID, monitorPID)
          expect(ok).toBe(false)
        } catch (e) {
          reject(e)
        }
        resolve()
      })
    }))

    it('handles already dead target process', async () => {
      const [, deadPID] = spawn(() => {})
      const [, deadPID2] = spawn(() => {})
      await timeout(1)
      const [ok] = Process.monitor(deadPID, deadPID2)
      expect({ok}).toEqual({ok: false})
    })

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
          expect(termCode).toBe('normal')
          expect(termPID).toBe(srcPID)
          expect(termResult).toBe(result)

          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }))

    it('handles living processes and captures error', () => new Promise((resolve, reject) => {
      const error = new Error()

      const [, srcPID] = spawn(async receive => {
        await receive()
        throw error
      })

      spawn(async (receive, monitorPID) => {
        try {
          const [ok] = Process.monitor(srcPID, monitorPID)
          expect(ok).toBe(true)

          send(srcPID)

          const [termCode, termPID, termResult] = await receive()
          expect(termCode).toBe('error')
          expect(termPID).toBe(srcPID)
          expect(termResult).toBe(error)

          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }))
  })

  describe('demonitor', () => {
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

          const [key, result] = await race({
            receive: receive(),
            timeout: timeout(10)
          })
          expect({key}).toEqual({key: 'timeout'})
          expect({result}).toEqual({result: undefined})

          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }))

    it('demonitor warns about unregistering dead processes', () => new Promise((resolve, reject) => {
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

          setTimeout(async () => {
            try {
              expect({monitorAlive2: Process.isAlive(monitor)}).toEqual({monitorAlive2: false})

              const [demonitored] = Process.demonitor(patient, monitor)
              expect({demonitored})
                .toEqual({demonitored: false})

              await send(patient)
              await timeout()
              expect({patientAlive2: Process.isAlive(patient)}).toEqual({patientAlive2: false})

              const [demonitored2] = Process.demonitor(patient, monitor)
              expect({demonitored2})
                .toEqual({demonitored2: false})

              resolve()
            } catch (e) {
              reject(e)
            }
          }, 1)
        } catch (e) {
          reject(e)
        }
      })
    }))

    it('demonitor requires two arguments', () => {
      const [, pid] = spawn(async receive => await receive())
      const [, pid2] = spawn(async receive => await receive())
      const [ok] = Process.demonitor()
      expect(ok).toBe(false)
      const [ok2] = Process.demonitor(pid)
      expect(ok2).toBe(false)
      const [ok3] = Process.demonitor(pid, pid2)
      expect(ok3).toBe(true)
    })
  })
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


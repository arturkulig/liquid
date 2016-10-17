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

  describe('endOf', () => {
    it('handles dead processes', async () => {
      const proof = {}
      const [, pid] = spawn(() => proof)

      await timeout(10)

      const [termCode, termPID, termReason] = await Process.endOf(pid)
      expect(termCode).toBe('normal')
      expect(termPID).toBe(pid)
      expect(termReason).toBe(proof)
    })

    it('handles live processes', async () => {
      const proof = {}
      const [, pid] = spawn(async receive => {
        await timeout()
        await receive()
        return proof
      })

      setTimeout(() => send(pid), 10)

      const [termCode, termPID, termResult] = await Process.endOf(pid)
      expect(termCode).toBe('normal')
      expect(termPID).toBe(pid)
      expect(termResult).toBe(proof)
    })
  })
})

async function timeout (interval = 0) {
  await new Promise(resolve => setTimeout(resolve, interval))
}


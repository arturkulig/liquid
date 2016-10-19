import {
  spawn,
  send
} from './Kernel'

/* globals describe, it, expect */

describe('kernel', () => {
  describe('spawn', () => {
    it('returns error if no process definiton', () => {
      const [ps] = spawn()
      expect(ps).toBe(false)
    })

    it('returns id when process defined', () => {
      const [ps, pid] = spawn(() => {})
      expect(ps).toBe(true)
      expect(pid).toBeDefined()
    })

    it('runs defined function', () => {
      return new Promise(resolve => {
        spawn(() => {
          resolve()
        })
      })
    })

    it('provides current pid as second argument', () => {
      return new Promise(resolve => {
        spawn((receive, pid) => {
          expect(pid).toBeDefined()
          expect(typeof pid).toBe('object')
          resolve()
        })
      })
    })

    it('runs defined async function', () => {
      return new Promise(resolve => {
        spawn(async () => {
          await timeout(10)
          resolve()
        })
      })
    })
  })

  it('spawn named', () => new Promise(async resolve => {
    const messageToSend = 'fgdfxfgxdfvxfgngj'

    const [spawned] = spawn(async receive => {
      const message = await receive()
      expect(message).toBe(messageToSend)
    }, 'test_proc')
    expect(spawned).toBe(true)

    const [sent, msg] = await send('test_proc', messageToSend)
    expect(sent).toBe(true)
    expect(msg).toBe('ok')

    resolve()
  }))

  describe('send and receive', () => {
    it('from outside of a process', () => new Promise(resolve => {
      const messageToSend = 'qazwsxedc'
      const [done, messageReceiver] = spawn(async receive => {
        const sentMessage = await receive()
        expect(sentMessage).toBe(messageToSend)
        resolve()
      })
      expect(done).toBe(true)
      expect(messageReceiver).toBeDefined()
      send(messageReceiver, messageToSend)
    }))

    it('from inside of another process', () => new Promise((resolve, reject) => {
      const order = []
      const messageToSend = {msg: 'wsxedcrfv'}

      const [receiverReady, messageReceiver] = spawn(async receive => {
        order.push(1)
        const message = await receive()
        try {
          expect(message).toBe(messageToSend)
        } catch (e) { reject(e) }
        order.push(3)
      })

      const [senderReady, messageSender] = spawn(async () => {
        order.push(2)
        await send(messageReceiver, messageToSend)
        order.push(4)
        await send(finisher)
      })

      const [finisherReady, finisher] = spawn(async receive => {
        await receive()
        try {
          expect(order).toEqual([1, 2, 3, 4])
        } catch (e) { reject(e) }
        resolve()
      })

      expect(receiverReady).toBe(true)
      expect(senderReady).toBe(true)
      expect(finisherReady).toBe(true)
      expect(messageReceiver).toBeDefined()
      expect(messageSender).toBeDefined()
      expect(finisher).toBeDefined()
    }))

    it('when receiver does not yet awaits for message', () => new Promise(resolve => {
      const messageToSend = 'dfgsdfdyjdfgsdrg'
      const [, pid] = spawn(async receive => {
        await timeout(10)
        const message = await receive()
        expect(message).toBe(messageToSend)
        resolve()
      })
      send(pid, messageToSend)
    }))
  })

  describe('send informs about delivery', () => {
    it('when no pid', async () => {
      const [ack] = await send(null)
      expect(ack).toBe(false)
    })

    it('when delivers correctly', async () => {
      const [, pid] = spawn(
        async receive => {
          await receive()
        }
      )
      await new Promise(resolve => setTimeout(resolve, 0))
      const [delivered, msg] = await send(pid)
      expect(msg).toBe('ok')
      expect(delivered).toBe(true)
    })

    it('when fails to deliver to sure dead process', async () => {
      const [, pid] = spawn(() => {})
      await timeout(0)
      const [delivered, msg] = await send(pid)
      expect(msg).toBe('Liquid.Kernel.send Dead process')
      expect(delivered).toBe(false)
    })

    it('when fails to deliver to soon dead process', () => new Promise(resolve => {
      spawn(async (receive, pid) => {
        (async () => {
          const [ack, reason] = await send(pid)
          expect(ack).toBe(false)
          expect(reason).toBe('Liquid.Kernel.send Dead process')
          resolve()
        })()
      })
    }))
  })
})

async function timeout (interval = 0) {
  await new Promise(resolve => setTimeout(resolve, interval))
}

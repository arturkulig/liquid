import * as GenEvent from './GenEvent'
import * as Process from './Process'

/* globals describe, it, expect */

describe('GenEvent', () => {
  it('starts', () => {
    const [ok, pid] = GenEvent.start()
    expect(ok).toBe(true)
    expect(pid).toBeDefined()
    expect(Process.isAlive(pid))
  })

  it('starts named', () => {
    const name = randomString()

    const [ok, pid] = GenEvent.start(name)
    expect(ok).toBe(true)
    expect(pid).toBeDefined()
    expect(Process.isAlive(name))

    const [ok2, pid2] = GenEvent.start(name)
    expect(ok2).toBe(false)
    expect(typeof pid2).toBe('string')
  })

  it('allows handlers', async () => {
    const [ok, ge] = GenEvent.start()
    expect(ok).toBe(true)
    expect(Process.isAlive(ge))

    let sentToGE = []
    const proof = {}

    const handler = event => {
      sentToGE.push(event)
    }
    await GenEvent.addHandler(ge, handler)

    await GenEvent.notify(ge, proof)

    await GenEvent.removeHandler(ge, handler)

    await GenEvent.notify(ge, proof)

    expect(sentToGE.length).toBe(1)
    expect(sentToGE[0]).toBe(proof)
  })
})

function randomString (amount = 16) {
  let result = ''
  for (let i = 0; i < amount; i++) {
    result +=
      randomStringDict.charAt(
        Math.round(Math.random() * randomStringDict.length)
      )
  }
  return result
}
const randomStringDict = 'qazwsxedcrfvtgbyhnujmikolp'

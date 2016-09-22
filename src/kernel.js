import {
    timeout,
    doFinally
} from './utils'

const procs = new Map()
const messages = []

let lastPID = 0

export {
  spawn,
  send
}

function spawn (func) {
    const pid = ++lastPID

    //console.log('function spawn', pid)

    const proc = {
        pid: pid,
        promise: runProcess(func, pid),
        requests: []
    }
    procs.set(proc.pid, proc)

    doFinally(
        proc.promise,
        () => {
            //console.log('spawn - process dead')
            procs.delete(proc.pid)
        }
    )

    return proc.pid;
}

async function runProcess (func, pid) {
    //console.log('function runProcess', pid)

    await timeout()
    return func(
        () => receive(pid),
        pid
    )
}

async function send (pid, message) {
    //console.log('function send', pid, message)

    const acknowledgement = new Promise(resolve => {
        messages.push([pid, message, resolve])
    })
    await release()
    await acknowledgement
}

async function receive (pid) {
    //console.log('function receive', pid)

    return await new Promise(resolve => {
        procs.get(pid).requests.push(resolve)
        release()
    });
}

let isReleasing = false

async function release () {
    //console.log('function release')

    if (isReleasing) return
    isReleasing = true

    const unhandledMessages = []

    let messagesEntry
    while (
        (messagesEntry = messages.splice(0, 1)).length
    ) {
        const [[pid, message, acknowledge]] = messagesEntry
        const proc = procs.get(pid)
        if (!proc) {
            //console.log('release - process', pid, 'dead')
            continue
        }
        const [request] = proc.requests.splice(0, 1)
        if (!request) {
            //console.log('release - process', pid, 'NOT receiving')
            unhandledMessages.push([pid, message, acknowledge])
            continue
        }
        //console.log('release - process', pid, 'receiving')
        request(message)
        await timeout(0)
        acknowledge()
    }

    //console.log('release, unhandled:', unhandledMessages.length)
    messages.splice(0, 0, ...unhandledMessages)

    isReleasing = false
}

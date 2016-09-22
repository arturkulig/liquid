import { spawn, send } from '../src'

function timeout(interval) {
    return new Promise(resolve => setTimeout(resolve, interval))
}

const p1 = spawn(async function (receive) {
    console.log('p1 start')
    while (true) {
        const message = await receive()
        console.log('p1 message', message)
        await timeout(1000)
        await send(p2, 'pong')
    }
})

const p2 = spawn(async function (receive) {
    console.log('p2 start')
    while (true) {
        const message = await receive()
        console.log('p2 message', message)
        await timeout(1000)
        await send(p1, 'ping')
    }
})

async function main() {
    console.log('main')
    try {
        await send(p1, 'start')
        console.log('main - sent')
    } catch (e) {
        console.log(e)
    }
}

main()

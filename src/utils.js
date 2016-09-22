export const noop = () => {}

export function timeout(interval = 0) {
    return new Promise(resolve => setTimeout(resolve, 0))
}

export async function doFinally(job, action) {
    try {
        return await job
    } catch(e) {}
    action()
}

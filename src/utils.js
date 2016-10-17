export const noop = () => {}

export function timeout (interval = 0) {
  return new Promise(
    (resolve) => setTimeout(
      () => resolve(timeout),
      interval
    )
  )
}

export function race (races) {
  return new Promise((resolve, reject) => {
    Object.keys(races).forEach(
      key => races[key].then(
        result => resolve([key, result]),
        reason => reject([key, reason])
      )
    )
  })
}

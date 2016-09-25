const processesByRef = new Map()

export {
  getByRef,
  register,
  unregister
}

function getByRef (pId) {
  return processesByRef.get(pId)
}

function register (ref, pInfo) {
  processesByRef.set(ref, pInfo)
}

function unregister (ref) {
  const pInfo = getByRef(ref)
  for (let [key, value] of processesByRef.entries()) {
    if (pInfo === value) {
      processesByRef.delete(key)
    }
  }
}

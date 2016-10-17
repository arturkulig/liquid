import * as ProcessList from './ProcessList'
import ProcessInfo from './ProcessInfo'

export function removeLink (links, source, target) {
  if (!links || !source || !target) {
    return [false, 'Liquid.Process.removeLink Insufficient amount of arguments']
  }

  const linkPosition = findLink(links, source, target)

  if (linkPosition === -1) {
    return [true, 'none']
  }

  links.splice(linkPosition, 1)

  return [true, 'ok']
}

export function ifLinkExists (links, questionedSource, questionedTarget) {
  return findLink(links, questionedSource, questionedTarget) >= 0
}

export function findLink (links, source, target) {
  let i = -1
  for (let [linkSource, linkTarget] of links) {
    i++
    if (
      source === linkSource &&
      target === linkTarget
    ) {
      return i
    }
  }
  return -1
}

export function splice (collection, comparator) {
  let i = -1
  let result = []
  for (let item of collection) {
    i++
    if (comparator(item)) {
      result.push(item)
      collection.splice(i, 1)
      i--
    }
  }
  return result
}

export function getPInfo (pid) {
  if (!pid) return
  const pInfo = ProcessList.getByRef(pid)
  if (!pInfo) return
  if (!ProcessInfo.isAlive(pInfo)) return
  return pInfo
}

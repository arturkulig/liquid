export default function createSymbol (name) {
  return typeof Symbol !== 'undefined'
    ? Symbol(name)
    : {toString: () => name}
}

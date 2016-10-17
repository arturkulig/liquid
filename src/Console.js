import {noop} from './utils'

/* globals process */

const DEFAULT_ENV = {
  NODE_ENV: 'production',
  DEBUG: 'false',
  LIQUID_DEBUG: 'false'
}

function getEnv () {
  try {
    return process.env || DEFAULT_ENV
  } catch (e) {
    return DEFAULT_ENV
  }
}

const debugConsole = getEnv().LIQUID_DEBUG !== 'true'
  ? {log: noop, warn: noop, error: noop, info: noop}
  : console

const externalConsole = (
  getEnv().NODE_ENV === 'production' ||
  getEnv().DEBUG === 'false' ||
  getEnv().LIQUID_DEBUG === 'true'
)
  ? {log: noop, warn: noop, error: noop, info: noop}
  : console

export {
  debugConsole,
  externalConsole
}

import { promisifyAll } from 'bluebird'

export const fs = promisifyAll(require('fs-extra'))

export function* eachObj(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]]
  }
}

export function* eachRE(regex, text) {
  let result
  while ((result = regex.exec(text)) !== null) {
    yield result[1]
  }
}

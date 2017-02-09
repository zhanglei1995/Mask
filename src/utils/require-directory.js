import path from 'path'
import CSON from 'cson'
import { fs } from './common'

export function getName(filename) {
  return path.basename(filename, path.extname(filename))
}

export function isDirectory(path) {
  return fs.statSync(path).isDirectory()
}

export default function requireDirectory(dirname) {
  const filenames = fs.readdirSync(dirname)
    .filter(filename => filename !== 'index.js')
    .map(filename => path.resolve(dirname, filename))
    .filter(absoluteFilename => !isDirectory(absoluteFilename))

  let result = {}
  for (let filename of filenames) {
    let ext = path.extname(filename)
      , name = getName(filename)

    switch (ext) {
      case '.cson':
        result[name] = CSON.parseCSONFile(filename)
        break
      case '.js':
      case '.json':
        result[name] = require(filename)
        break
      case '.tlml':
      case '.md':
      default:
        result[name] = filename
    }
  }
  return result
}

import init from './init'
import build from './build'
import serve from './serve'

export async function start() {
  console.log('init')
  await init()
  console.log('build')
  await build()
  console.log('serve')
  await serve()
}

if (require.main === module) {
  start()
}

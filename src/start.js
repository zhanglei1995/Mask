import { init } from './init'
import { build } from './build'
import { serve } from './serve'

export async function start() {
  await init()
  await build()
  await serve()
}

if (require.main === module) {
  serve()
}

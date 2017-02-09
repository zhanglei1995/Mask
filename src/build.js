import * as builder from './builder'
import { fs } from './utils/common'

export async function buildAll() {
  await [
    builder.buildAllPosts()
  , builder.buildAllTags()
  , builder.buildHome()
  , builder.buildAssets()
  , builder.buildFeed()
  , builder.build404()
  ]
}

export async function buildAboutConfig() {
  await [
    builder.buildAllPosts()
  , builder.buildAllTags()
  , builder.buildHome()
  , builder.buildFeed()
  , builder.build404()
  ]
}

export async function buildAboutTheme() {
  await [
    builder.buildAllPosts()
  , builder.buildAllTags()
  , builder.buildHome()
  , builder.build404()
  ]
}

if (require.main === module) {
  (async () => {
    await fs.removeAsync('public')
    await fs.mkdirsAsync('public')
    await buildAll()
  })()
}

import * as builder from './builder'
import { fs } from './utils/common'

export async function buildAll() {
  await builder.buildAllPosts()
  await builder.buildAllTags()
  await builder.buildHome()
  await builder.buildAssets()
  await builder.buildFeed()
  await builder.build404()
}

export async function buildAboutConfig() {
  await builder.buildAllPosts()
  await builder.buildAllTags()
  await builder.buildHome()
  await builder.buildFeed()
  await builder.build404()
}

export async function buildAboutTheme() {
  await builder.buildAllPosts()
  await builder.buildAllTags()
  await builder.buildHome()
  await builder.build404()
}

export default async function build() {
  await fs.removeAsync('public')
  await fs.mkdirsAsync('public')
  await buildAll()
}

if (require.main === module) {
  build()
}

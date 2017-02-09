import chokidar from 'chokidar'
import { fs } from './utils/common'
import { requireDirectory, getName } from './utils/require-directory'
import { parseMarkdownFileAsync, extractSlug, readMeta, writeMeta, isPostPublished } from './utils/markdown-parser'
import { buildAll, buildAboutConfig, buildAboutTheme } from './build'
import { buildSinglePost, buildSingleTag, buildHome, buildFeed } from './builder'

async function addSinglePost(filename) {
  return
  let post = await parseMarkdownFileAsync(filename)
  await fs.outputFileAsync(filename, writeMeta(post.text, {
    ...post.meta
  , published_at: new Date()
  , updated_at: new Date()
  }))
  post = await parseMarkdownFileAsync(filename)
  await buildSinglePost(post)
  for (let tag of post.meta.tags) {
    await buildSingleTag(tag)
  }
  await buildHome()
  await buildFeed()
}

async function changeSinglePost(filename) {
  return
  let post = await parseMarkdownFileAsync(filename)
  await fs.outputFileAsync(filename, writeMeta(post.text, {
    ...post.meta
  , updated_at: new Date()
  }))
  post = await parseMarkdownFileAsync(filename)
  await buildSinglePost(post)
  for (let tag of post.meta.tags) {
    await buildSingleTag(tag)
  }
  await buildHome()
  await buildFeed()
}

async function removeSinglePost(filename) {
  console.log('remove', filename)
  return
  let slug = extractSlug(filename)
  await fs.removeAsync(`public/${ slug }.html`)
  await buildTags()
  await buildHome()
  await buildFeed()
}

function watchContent() {
  chokidar.watch('data/content/*.md', {
    ignored: /(^|[\/\\])\../
  , ignoreInitial: true
  })
  .on('unlink', removeSinglePost)
  .on('add', addSinglePost)
  .on('change', changeSinglePost)
}

function watchTheme(themeName) {
  return chokidar.watch(`data/theme/${ themeName }`, {
    ignored: /(^|[\/\\])\../
  , ignoreInitial: true
  })
  .on('all', (event, path) => {
    console.log(`Config ${ path } changed.`)
    buildAboutTheme()
  })
}

function watchConfig({ themeWatcher }) {
  let activeTheme = requireDirectory('data/config').blog.activeTheme

  return chokidar.watch('data/config/*.[jc]son', {
    ignored: /(^|[\/\\])\../
  , ignoreInitial: true
  })
  .on('all', (event, path) => {
    switch (getName(path)) {
      case 'blog':
        let newTheme = requireDirectory('data/config').blog.activeTheme
        if (activeTheme !== newTheme) {
          activeTheme = newTheme
          themeWatcher.close()
          themeWatcher = watchTheme(activeTheme)
        }
      case 'router':
      default:
        buildAboutConfig()
    }
  })
}

function startWatch() {
  watchConfig({
    themeWatcher: watchTheme(config.blog.activeTheme)
  })
  watchContent()
}

if (require.main === module) {
  startWatch()
  console.log('Watching changes...')
}

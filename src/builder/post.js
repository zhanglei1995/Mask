import uuid from 'uuid/v4'
import requireDirectory from '../utils/require-directory'
import * as maskTags from '../utils/mask-tags'
import { eachObj, fs } from '../utils/common'
import { compileTlmlFile } from 'tlml'
import { parseMarkdownFileAsync, isPostPublished, readMeta, writeMeta } from '../utils/markdown-parser'

export async function buildSinglePost(post) {
  const config = requireDirectory('data/config')
  const theme = requireDirectory(`data/theme/${ config.blog.activeTheme }`)

  if (isPostPublished(post)) {
    const context = {
      post
    , bodyClass: 'post-template'
    }

    await fs.outputFileAsync(`public/${ post.meta.slug }.html`, await compileTlmlFile(theme.post, {
      ...config
    , mask: maskTags
    , ...maskTags
    , context
    , ...context
    }))
  } else {
    await fs.removeAsync(`public/${ post.meta.slug }.html`)
  }
}

function updateMeta(meta) {
  const config = requireDirectory('data/config')

  if (meta.status === 'published') {
    if (!meta.published_at) {
      meta.published_at = new Date()
    }
  }

  if (!meta.author) {
    meta.author = config.blog.default_author
  }

  if (!meta.id) {
    meta.id = uuid()
  }

  if (meta.tags.length === 0) {
    delete meta.tags
  }

  meta.updated_at = new Date()

  return meta
}

export async function buildAllPosts() {
  await fs.removeAsync('public/*.html')
  const postFilenames = requireDirectory('data/content')
  for (let [, filename] of eachObj(postFilenames)) {
    let text = await fs.readFileAsync(filename, 'utf-8')
      , meta = readMeta(text)
    await fs.outputFileAsync(filename, writeMeta(text, updateMeta(meta)))
    await buildSinglePost(await parseMarkdownFileAsync(filename))
  }
}

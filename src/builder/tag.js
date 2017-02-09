import _ from 'lodash'
import * as maskTags from '../utils/mask-tags'
import requireDirectory from '../utils/require-directory'
import { eachObj, fs } from '../utils/common'
import { compileTlmlFile } from 'tlml'
import { isPostPublished } from './post'
import { parseMarkdownFileAsync } from '../utils/markdown-parser'

async function buildTag(context) {
  const config = requireDirectory('data/config')
  const theme = requireDirectory(`data/theme/${ config.blog.activeTheme }`)

  context = {
    ...context
  , bodyClass: 'tag-template'
  }

  await fs.outputFileAsync(
    `public/tag/${ context.tag.name }/page/${ context.pagination.page }.html`
  , await compileTlmlFile(theme.tag, {
      ...config
    , mask: maskTags
    , ...maskTags
    , context
    , ...context
    })
  )
}

export async function buildSingleTag(tag) {
  const postFilenames = requireDirectory('data/content')
  const config = requireDirectory('data/config')

  let posts = []
  for (let [, filename] of eachObj(postFilenames)) {
    let post = await parseMarkdownFileAsync(filename)
    if (post.meta.tags.includes(tag)) {
      posts.push(post)
    }
  }

  let postsSorted = _(posts)
        .sortBy(post => post.meta.published_at)
        .filter(isPostPublished)
        .reverse()
        .value()
    , total = Math.ceil(postsSorted.length / config.blog.postsPerPage)
  for (let i = 0, page = 1; i < postsSorted.length; i += config.blog.postsPerPage, page++) {
    await buildTag({
      posts: postsSorted.slice(i, i + config.blog.postsPerPage)
    , pagination: { page, total }
    , tag: { name: tag }
    })
  }
}

export async function buildAllTags() {
  const postFilenames = requireDirectory('data/content')
  const config = requireDirectory('data/config')

  await fs.removeAsync('public/tag')
  let tags = {}
  for (let [, filename] of eachObj(postFilenames)) {
    let post = await parseMarkdownFileAsync(filename)
    for (let tag of post.meta.tags) {
      if (!_.isArray(tags[tag])) {
        tags[tag] = []
      }
      tags[tag].push(post)
    }
  }

  for (let [tag, posts] of eachObj(tags)) {
    let postsSorted = _(posts)
          .sortBy(post => post.meta.published_at)
          .filter(isPostPublished)
          .reverse()
          .value()
      , total = Math.ceil(postsSorted.length / config.blog.postsPerPage)
    for (let i = 0, page = 1; i < postsSorted.length; i += config.blog.postsPerPage, page++) {
      await buildTag({
        posts: postsSorted.slice(i, i + config.blog.postsPerPage)
      , pagination: { page, total }
      , tag: { name: tag }
      })
    }
  }
}

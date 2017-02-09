import _ from 'lodash'
import * as maskTags from '../utils/mask-tags'
import requireDirectory from '../utils/require-directory'
import { fs, eachObj } from '../utils/common'
import { compileTlmlFile } from 'tlml'
import { isPostPublished } from './post'
import { parseMarkdownFileAsync } from '../utils/markdown-parser'

export async function buildHome() {
  fs.removeSync('public/home')

  const postFilenames = requireDirectory('data/content')
  const config = requireDirectory('data/config')
  const theme = requireDirectory(`data/theme/${ config.blog.activeTheme }`)

  let posts = []
  for (let [, filename] of eachObj(postFilenames)) {
    posts.push(await parseMarkdownFileAsync(filename))
  }

  let postsSorted = _(posts)
        .sortBy(post => post.meta.published_at)
        .filter(isPostPublished)
        .reverse()
        .value()
    , total = Math.ceil(postsSorted.length / config.blog.postsPerPage)
  for (let i = 0, page = 1; i < postsSorted.length; i += config.blog.postsPerPage, page++) {
    let context = {
      posts: postsSorted.slice(i, i + config.blog.postsPerPage)
    , pagination: {
        page
      , total
      }
    , bodyClass: 'home-template'
    }

    fs.outputFileSync(`public/home/page/${ page }.html`, await compileTlmlFile(theme.home, {
      ...config
    , mask: maskTags
    , ...maskTags
    , context
    , ...context
    }))
  }
}

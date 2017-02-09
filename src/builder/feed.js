import _ from 'lodash'
import RSS from 'rss'
import url from 'url'
import requireDirectory from '../utils/require-directory'
import { fs, eachObj } from '../utils/common'
import { name, version } from '../../package'
import { parseMarkdownFileAsync, isPostPublished } from '../utils/markdown-parser'

export async function buildFeed() {
  const config = requireDirectory('data/config')
  const postFilenames = requireDirectory('data/content')

  let posts = []
  for (let [, filename] of eachObj(postFilenames)) {
    posts.push(await parseMarkdownFileAsync(filename))
  }

  let feed = new RSS({
    title: config.blog.title
  , description: config.blog.description
  , generator: `${ name } ${ version }`
  , feed_url: url.resolve(config.blog.site, '/rss/')
  , site_url: url.resolve(config.blog.site, '/')
  , pubDate: new Date()
  , ttl: 60
  })

  const postsSorted = _(posts)
    .sortBy(post => post.meta.published_at)
    .filter(isPostPublished)
    .reverse()
    .value()

  for (let post of postsSorted.slice(0, 20)) {
    feed.item({
      title: post.meta.title
    , description: post.html
    , url: url.resolve(config.blog.site, `/${ post.meta.slug }/`)
    , guid: '' + post.meta.id
    , categories: post.meta.tags
    , author: post.meta.author
    , date: post.meta.published_at
    })
  }

  await fs.outputFileAsync('public/feed/rss.xml', feed.xml())
}

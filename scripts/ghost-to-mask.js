import path from 'path'
import cson from 'cson'
import { fs } from '../src/utils/common'
import { writeMeta } from '../src/utils/markdown-parser'

function parseSettings(settings) {
  let result = {}
  for (let { key, value } of settings) {
    result[key] = value
  }
  return result
}

function parsePosts(posts, posts_tags, tags, users) {
  let result = []
  for (let { id, markdown, published_at, slug, status, title, updated_at, author_id } of posts) {
    result.push({
      id
    , markdown
    , published_at
    , slug
    , status
    , title
    , updated_at
    , author: users
        .find(x => x.id === author_id)
        .name
    , tags: posts_tags
        .filter(x => x.post_id === id)
        .map(x => x.tag_id)
        .map(id => tags.find(x => x.id === id).name)
    })
  }
  return result
}

;(async () => {
  const [filename] = process.argv.slice(2)

  let {
    db: [{
      data: {
        posts
      , settings
      , posts_tags
      , tags
      , users
      }
    }]
  } = require(path.resolve(filename))

  let {
    title
  , description
  , email
  , logo
  , defaultLang
  , postsPerPage
  , ghost_head
  , ghost_foot
  , permalinks
  , navigation
  , activeTheme
  , activeTimezone
  } = parseSettings(settings)

  await fs.outputFileAsync('data/config/blog.cson', cson.stringify({
    title
  , description
  , email
  , logo
  , defaultLang
  , postsPerPage: Number(postsPerPage)
  , headInjection: ghost_head
  , footInjection: ghost_foot
  , navigation: JSON.parse(navigation)
  , activeTheme: `mask-${ activeTheme }`
  , activeTimezone
  , site: users[0].website
  }, null, 2))

  await fs.outputFileAsync('data/config/router.cson', cson.stringify({
    '/': '/home/page/1.html'
  , '/404': '/other/404.html'
  , '/rss': '/feed/rss.xml'
  , '/page/:page': '/home/page/:page.html'
  , '/tag/:tag': '/tag/:tag/page/1.html'
  , '/tag/:tag/page/:page': '/tag/:tag/page/:page.html'
  , [permalinks]: '/:slug.html'
  , '/assets/*': '/assets/*'
  }))

  for (let post of parsePosts(posts, posts_tags, tags, users)) {
    await fs.outputFileAsync(`data/content/${ post.slug }.md`, `# ${ post.title }\n` + writeMeta(post.markdown, {
      author: post.author
    , id: post.id
    , status: post.status
    , tags: post.tags.join(', ')
    , 'published_at': post.published_at
    , 'updated_at': post.updated_at
    }))
  }
})()

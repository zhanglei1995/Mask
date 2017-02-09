import requireDirectory from '../utils/require-directory'
import * as maskTags from '../utils/mask-tags'
import { eachObj, fs } from '../utils'
import { compileTlmlFile } from 'tlml'
import { parseMarkdownFileAsync, isPostPublished } from '../utils/markdown-parser'

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

export async function buildAllPosts() {
  await fs.removeAsync('public/*.html')
  const postFilenames = requireDirectory('data/content')
  for (let [, filename] of eachObj(postFilenames)) {
    const post = await parseMarkdownFileAsync(filename)
    await buildSinglePost(post)
  }
}

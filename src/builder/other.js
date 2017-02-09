import * as maskTags from '../utils/mask-tags'
import requireDirectory from '../utils/require-directory'
import { fs } from '../utils/common'
import { compileTlmlFile } from 'tlml'

export async function build404() {
  const config = requireDirectory('data/config')
  const theme = requireDirectory(`data/theme/${ config.blog.activeTheme }`)

  const context = {
    bodyClass: '404-template'
  }

  await fs.outputFileAsync('public/other/404.html', await compileTlmlFile(theme['404'], {
    ...config
  , mask: maskTags
  , ...maskTags
  , context
  , ...context
  }))
}

import { fs } from '../utils/common'
import requireDirectory from '../utils/require-directory'

export async function buildAssets() {
  const config = requireDirectory('data/config')
  await fs.copyAsync(`data/theme/${ config.blog.activeTheme }/assets`, 'public/assets')
}

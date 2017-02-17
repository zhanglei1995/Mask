import Koa from 'koa'
import path from 'path'
import send from 'koa-send'
import logger from 'koa-logger'
import requireDirectory from './utils/require-directory'
import { eachObj, fs } from './utils/common'

export default function serve() {
  const config = requireDirectory('./data/config/')
  const router = require('koa-router')()
  const app = new Koa()
  const PORT = 3000

  for (let [urlPattern, filenamePattern] of eachObj(config.router)) {
    router.get(urlPattern, async (ctx, next) => {
      if (!path.extname(ctx.originalUrl) && !ctx.originalUrl.endsWith('/')) {
        ctx.status = 302
        ctx.redirect(ctx.originalUrl + '/')
        return
      }
      let filename = filenamePattern
      for (let [name, value] of eachObj(ctx.params)) {
        filename = filename.replace(`:${ name }`, value)
      }
      for (let i = 0; filename.includes('*'); i++) {
        filename = filename.replace('*', ctx.params[i])
      }
      try {
        await fs.accessAsync(path.join(__dirname, '../public', filename))
        await send(ctx, filename, {
          root: path.join(__dirname, '../public')
        })
      } catch(e) {
        ctx.status = 404
        ctx.redirect('/404/')
      }
    })
  }
  app
  .use(logger())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(PORT)
  console.log(`Server running at http://127.0.0.1:${ PORT }`)
}

if (require.main === module) {
  serve()
}

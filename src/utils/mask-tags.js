import _ from 'lodash'
import url from 'url'
import moment from 'moment'
import sanitize from 'sanitize-html'
import requireDirectory from './require-directory'
import { eachObj } from './common'
import { createTag, composeTag } from 'tlml'

const config = requireDirectory('data/config')

export const asset = createTag({
  onResult: x => url.resolve('/assets/', x)
})

export const dateFormat = format => createTag({
  onInjection: x => moment(x).format(format)
})

export const classes = createTag({
  onInjection: className => className ? className : ''
, onResult: result => `class="${ result.replace(/\s{1:}/g, ' ').trim() }"`
})

export const styles = createTag({
  onInjection(styles) {
    let result = ''
    for (let [name, value] of eachObj(styles)) {
      result += `${ name.replace(/([A-Z])/g,"-$1").toLowerCase() }: ${ value }`
    }
  }
})

export const prefix = prefix => createTag({
  onResult: x => `${ prefix }${ x }`
})

export const absoluteUrl = createTag({
  onResult: x => url.resolve(config.blog.site, x)
})

export const removeHtmlTags = createTag({
  onResult: x => sanitize(x, {
    allowedTags: []
  , allowedAttributes: []
  })
})

export const substring = (...args) => createTag({
  onResult: x => x.substring(...args)
})

export const oneline = createTag({
  onResult: x => x
    .replace(/\n/g, ' ')
    .replace(/\s{1:}/g, ' ')
    .trim()
})

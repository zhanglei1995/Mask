import _ from 'lodash'
import path from 'path'
import marked from 'marked'
import remark from 'remark'
import stringify from 'remark-stringify'
import { fs, eachRE, eachObj } from './common'

export function isPostPublished(post) {
  return post.meta.status === 'published'
}

export function isHeading1(x) {
  return x => x.type === 'heading' && x.depth === 1
}

export function parseTitle(text) {
  return marked.lexer(text).find(isHeading1).text
}

export function spaceToHyphen(text) {
  return text.replace(/ /g, '_')
}

export function writeMeta(text, meta) {
  function attacher(processor, meta) {
    return function transformer(root) {
      for (let i = 0; i < root.children.length; i++) {
        let node = root.children[i]
        if (node.type === 'definition'
        && node.identifier === '//'
        && node.url === '#') {
          root.children.splice(i, 1)
          i--
        }
      }

      let definitions = []
      for (let [key, value] of eachObj(meta)) {
        if (key === 'title') {
          continue
        }
        definitions.push({
          type: 'definition'
        , identifier: '//'
        , title: `${ spaceToHyphen(key) }: ${ value }`
        , url: '#'
        })
      }

      root.children.splice(1, 0, ...definitions)
    }
  }

  return remark()
  .use(attacher, meta)
  .process(text)
}

export function readMeta(text) {
  let metaList = remark()
    .parse(text)
    .children
    .filter(x => x.type === 'definition' && x.identifier === '//' && x.url === '#')
    .map(x => x.title.split(': '))

  let meta = {}
  for (let [key, value] of metaList) {
    meta[spaceToHyphen(key.trim()).toLowerCase()] = value.trim()
  }

  if (!meta.title) {
    meta.title = parseTitle(text)
  }

  if (meta.published_at) {
    meta.published_at = new Date(meta.published_at)
  }

  if (meta.updated_at) {
    meta.updated_at = new Date(meta.updated_at)
  }

  if (meta.tags) {
    meta.tags = meta.tags.split(',').map(x => x.trim())
  } else {
    meta.tags = []
  }

  return meta
}

export function removeFirstHeading1TitleToken(tokens, func) {
  let isFirst = false
    , newTokens = tokens.filter(x => {
      if (!isFirst && isHeading1(x)) {
        isFirst = true
        return false
      }
      return true
    })
  newTokens.links = tokens.links
  return newTokens
}

export function extractSlug(filename) {
  return path.basename(filename, '.md')
}

export function parseMarkdown(markdownText, extraMeta) {
  let tokens = removeFirstHeading1TitleToken(marked.lexer(markdownText))
  return _.merge({
    text: markdownText
  , html: marked.parser(tokens)
  , meta: readMeta(markdownText)
  }, extraMeta)
}

export function parseMarkdownFile(filename) {
  let slug = extractSlug(filename)
    , text = fs.readFileSync(filename, 'utf-8')
  return parseMarkdown(text, { meta: { slug }})
}

export async function parseMarkdownFileAsync(filename) {
  let slug = extractSlug(filename)
    , text = await fs.readFileAsync(filename, 'utf-8')
  return parseMarkdown(text, { meta: { slug }})
}

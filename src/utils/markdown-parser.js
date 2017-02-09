import _ from 'lodash'
import path from 'path'
import marked from 'marked'
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
  let metaStrings = []
  for (let [key, value] of eachObj(meta)) {
    metaStrings.push(`[//]: # (${ spaceToHyphen(key) }: ${ value })`)
  }
  return `${ metaStrings.join('\n') }\n${ text }`
}

export function readMeta(text) {
  const metaRE = /\[\/\/\]\: \# \(([^\n]+)\)/g

  let meta = {}
  for (let result of eachRE(metaRE, text)) {
    let [key, value] = result.split(': ')
    meta[spaceToHyphen(key).toLowerCase()] = value.trim()
  }

  if (!meta.title) {
    meta.title = parseTitle(text)
  }

  if (meta.id) {
    meta.id = Number(meta.id)
  }

  if (meta.published_at) {
    meta.published_at = new Date(meta.published_at)
  }

  if (meta.updated_at) {
    meta.updated_at = new Date(meta.updated_at)
  }

  if (meta.tags) {
    meta.tags = meta.tags.split(', ')
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

import Git from 'nodegit'
import path from 'path'
import { fs } from './utils/common'
import { helperTags } from 'tlml'

export async function addAndCommitAll(repo, message) {
  const signDefault = Git.Signature.default(repo)

  let files = []
  for (let x of await repo.getStatus()) {
    let path = x.path()
    if (path[path.length - 1] === '/') {
      path = path.substring(0, path.length - 1)
    }
    files.push(path)
  }

  if (files.length > 0) {
    await repo.createCommitOnHead(files, signDefault, signDefault, message)
  }
}

export default async function init() {
  try {
    await fs.accessAsync('data')
  } catch(e) {
    await fs.copyAsync('default', 'data')
  }

  const BARE_TRUE = 1
  const BARE_FALSE = 0

  let repoData
  try {
    repoData = await Git.Repository.open('data')
  } catch(e) {
    // data is not a repo
    repoData = await Git.Repository.init('data', BARE_FALSE)
  }
  await addAndCommitAll(repoData, 'sync')

  let repoBare
  try {
    repoBare = await Git.Clone.clone('data', 'data.git', { bare: BARE_TRUE })
  } catch(e) {
    // data.git is a repo
    repoBare = await Git.Repository.open('data.git')
  }

  let remote
  if ((await Git.Remote.list(repoData)).includes('origin')) {
    remote = await Git.Remote.lookup(repoData, 'origin')
  } else {
    remote = await Git.Remote.create(repoData, 'origin', path.resolve('data.git'))
  }

  await remote.push(['refs/heads/master:refs/heads/master'])

  // add post-receive hook
  await fs.outputFileAsync('data.git/hooks/post-receive', await helperTags.trim `
    #!/bin/sh
    node ../lib/hooks/post-receive.js
  `)
}

if (require.main === module) {
  init()
}

import Git from 'nodegit'
import path from 'path'
import { fs } from './utils/common'
import { helperTags } from 'tlml'

export async function addAndCommitAll(repo, message) {
  const author = Git.Signature.default(repo)

  let index = await repo.refreshIndex()
  for (let x of await repo.getStatus()) {
    let path = x.path()
    if (path[path.length - 1] === '/') {
      path = path.substring(0, path.length - 1)
    }

    if (x.isDeleted()) {
      await index.removeByPath(path)
    } else {
      await index.addByPath(path)
    }
  }
  await index.write()

  let head = await Git.Reference.nameToId(repo, 'HEAD')
    , parent = await repo.getCommit(head)
    , tree = await index.writeTree()
  
  await repo.createCommit('HEAD', author, author, message, tree, [parent])
}

export async function isEmptyDir(pathname) {
  return (await fs.readdirAsync('data')).length === 0
}

export default async function init() {
  try {
    await fs.accessAsync('data')
    if (await isEmptyDir('data')) {
      throw new Error('Empty dir')
    }
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

  // create post-receive hook
  await fs.outputFileAsync('data.git/hooks/post-receive', await helperTags.trim `
    #!/bin/sh
    node ../lib/hooks/post-receive.js
  `)
}

if (require.main === module) {
  init()
}

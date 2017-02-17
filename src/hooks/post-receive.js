import Git from 'nodegit'
import path from 'path'
import { buildAll } from '../build'
import { extractSlug } from '../utils/markdown-parser'

function getRootDir(pathname) {
  while (true) {
    let dir = path.dirname(pathname)
    if (dir === '.') {
      return pathname
    } else {
      pathname = dir
    }
  }
}

async function postReceiveHandler() {
  let repoData = await Git.Repository.open('../data')
  await repoData.fetchAll()
  await repoData.mergeBranches('master', 'origin/master')
  let commit = await repoData.getHeadCommit()
    , needRemoveSlugs = []
  for (let diff of await commit.getDiff()) {
    for (let patch of await diff.patches()) {
      let newFilePath = patch.newFile().path()
        , oldFilePath = patch.oldFile().path()
        , newFileRootDir = getRootDir(newFilePath)
        , oldFileRootDir = getRootDir(oldFilePath)
      if (oldFileRootDir === 'content' && (patch.isDeleted() || patch.isRenamed())) {
        needRemove.push(extractSlug(oldFilePath))
      }
    }
  }
  await buildAll()
  for (let slug of needRemoveSlugs) {
    await fs.removeAsync(`../public/${ slug }.html`)
  }
}

if (require.main === module) {
  postReceiveHandler()
}

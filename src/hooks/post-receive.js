import Git from 'nodegit'

async function postReceiveHandler() {
  let repoData = await Git.Repository.open('../data')
  await repoData.fetchAll()
  await repoData.mergeBranches('master', 'origin/master')
  let commit = await repoData.getHeadCommit()
  for (let diff of await commit.getDiff()) {
    for (let patch of await diff.patches()) {
      console.log('isAdded: ', patch.isAdded())
      console.log('isDeleted: ', patch.isDeleted())
      console.log('oldFile path: ', patch.oldFile().path())
      console.log('newFile path: ', patch.newFile().path())
    }
  }
}

if (require.main === module) {
  postReceiveHandler()
}

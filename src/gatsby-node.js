import lunr from 'lunr'

export const onPostBuild = ({ graphql }, { queries }) => {
  const jobs = queries.map(async query => {})

  return Promise.all(jobs)
}

import createNodeHelpers from 'gatsby-node-helpers'
import lunr from 'lunr'
import { forEach } from 'p-iteration'
import R from 'ramda'

const { createNodeFactory } = createNodeHelpers({ typePrefix: 'LocalSearch' })

export const createPages = async (
  { graphql, actions: { createNode } },
  { name, ref = 'id', store: storeFields, query, normalizer },
) => {
  const result = await graphql(query)
  if (result.errors) throw R.head(result.errors)

  const documents = await Promise.resolve(normalizer(result))
  if (R.isEmpty(documents)) {
    console.log(
      `gatsby-plugin-local-search returned no documents for query "${name}"`,
    )
    return
  }

  const fields = R.pipe(
    R.head,
    R.keys,
    R.reject(R.equals(ref)),
  )(documents)

  const index = lunr(function() {
    this.ref(ref)
    fields.forEach(x => this.field(x))
    documents.forEach(x => this.add(x))
  })

  const store = R.pipe(
    R.map(R.pick(storeFields)),
    R.indexBy(R.prop(ref)),
  )(documents)

  R.pipe(
    createNodeFactory(name),
    createNode,
  )({
    id: name,
    index: JSON.stringify(index),
    store: JSON.stringify(store),
  })

  return
}

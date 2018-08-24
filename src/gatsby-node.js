import createNodeHelpers from 'gatsby-node-helpers'
import lunr from 'lunr'
import { forEach } from 'p-iteration'
import R from 'ramda'

const { createNodeFactory } = createNodeHelpers({ typePrefix: 'LocalSearch' })

/***
 * Takes a query object with accessory options and returns an object to be
 * passed to `createNode`.
 */
const prepareNode = graphql => async ({
  name,
  ref = 'id',
  query,
  normalizer,
  store: storeFields = [],
}) => {
  const result = await graphql(query)
  if (result.errors) throw R.head(result.errors)

  const documents = await Promise.resolve(normalizer(result))
  if (R.isEmpty(documents)) return

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

  const LocalSearchNode = createNodeFactory(name)

  return LocalSearchNode({
    id: name,
    index: JSON.stringify(index),
    store: JSON.stringify(store),
  })
}

export const createPages = async (
  { graphql, actions: { createNode } },
  { queries = [] },
) =>
  forEach(
    queries,
    R.pipeP(
      prepareNode(graphql),
      createNode,
    ),
  )

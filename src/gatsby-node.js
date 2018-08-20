import createNodeHelpers from 'gatsby-node-helpers'
import lunr from 'lunr'
import R from 'ramda'
import { map } from 'p-iteration'

const { createNodeFactory } = createNodeHelpers({ typePrefix: 'LocalSearch' })

/***
 * Takes a query object with accessory options and returns a node to be passed
 * to `createNode`.
 */
const prepareNode = graphql => async ({
  name,
  ref = 'id',
  query,
  normalizer,
}) => {
  const documents = await R.pipeP(
    graphql,
    normalizer,
  )(query)

  if (R.isEmpty(documents)) return

  const fields = R.pipe(
    R.head,
    R.keys,
    R.reject(R.equals(ref)),
  )(documents)

  const index = lunr(function() {
    this.ref(ref)
    R.forEach(this.field)(fields)
    R.forEach(this.add)(documents)
  })

  const LocalSearchNode = createNodeFactory(name)

  return LocalSearchNode({
    id: name,
    index: JSON.stringify(index),
  })
}

export const createPages = async (
  { graphql, actions: { createNode } },
  { queries = [] },
) =>
  map(
    queries,
    R.pipeP(
      prepareNode(graphql),
      createNode,
    ),
  )

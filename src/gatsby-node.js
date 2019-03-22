import createNodeHelpers from 'gatsby-node-helpers'
import { GraphQLJSON } from 'gatsby/graphql'
import lunr from 'lunr'
import FlexSearch from 'flexsearch'
import * as R from 'ramda'

const { createNodeFactory } = createNodeHelpers({ typePrefix: 'LocalSearch' })

export const setFieldsOnGraphQLNodeType = ({ type }) => {
  if (!type.name.startsWith('LocalSearch')) return

  // Allow querying for store without providing subfields
  return {
    store: { type: GraphQLJSON },
  }
}

// Returns an exported FlexSearch index using the provided documents, fields,
// and ref.
const createFlexSearchIndexExport = ({ documents, fields, ref }) => {
  const index = new FlexSearch({
    doc: {
      id: ref,
      field: fields,
    },
  })

  index.add(documents)

  return index.export()
}

// Returns an exported Lunr index using the provided documents, fields, and
// ref.
const createLunrIndexExport = ({ documents, fields, ref }) => {
  const index = lunr(function() {
    this.ref(ref)
    fields.forEach(x => this.field(x))
    documents.forEach(x => this.add(x))
  })

  return JSON.stringify(index)
}

// Returns an exported index using the provided engine, documents, fields, and
// ref. Throws if the provided engine is invalid.
const createIndexExport = ({ engine, ...args }) => {
  switch (engine) {
    case 'flexsearch':
      return createFlexSearchIndexExport(args)

    case 'lunr':
      return createLunrIndexExport(args)

    default:
      throw new Error(
        'gatsby-plugin-local-search engine is invalid. Must be one of: flexsearch, lunr.',
      )
  }
}

export const createPages = async (
  { graphql, actions: { createNode } },
  { name, ref = 'id', store: storeFields, query, normalizer, engine },
) => {
  const result = await graphql(query)
  if (result.errors) throw R.head(result.errors)

  const documents = await Promise.resolve(normalizer(result))
  if (R.isEmpty(documents)) {
    console.log(
      `gatsby-plugin-local-search returned no documents for query "${name}". Skipping index creation.`,
    )
    return
  }

  const fields = R.pipe(
    R.head,
    R.keys,
    R.reject(R.equals(ref)),
  )(documents)

  const index = createIndexExport({ engine, documents, fields, ref })

  // Default to all fields if storeFields is not provided
  const store = R.pipe(
    R.map(R.pick(storeFields || [...fields, ref])),
    R.indexBy(R.prop(ref)),
  )(documents)

  R.pipe(
    createNodeFactory(name),
    createNode,
  )({
    id: name,
    engine,
    index,
    store,
  })

  return
}

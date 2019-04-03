import createNodeHelpers from 'gatsby-node-helpers'
import lunr from 'lunr'
import FlexSearch from 'flexsearch'
import * as R from 'ramda'
import lowerFirst from 'lodash.lowerfirst'

const { createNodeFactory, generateTypeName } = createNodeHelpers({
  typePrefix: 'LocalSearch',
})

// Returns an exported FlexSearch index using the provided documents, fields,
// and ref.
const createFlexSearchIndexExport = ({ documents, ref }) => {
  const index = FlexSearch.create()

  documents.forEach(doc => index.add(doc[ref], JSON.stringify(doc)))

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

export const sourceNodes = ({ actions: { createTypes } }) => {
  createTypes(`
    type LocalSearchIndex implements Node {
      id: String!
      engine: String!
      index: String!
      store: JSON!
    }
  `)
}

// Run GraphQL query during createPages and save to cache. The result will be
// used later in the bootstrap process to create the index node.
export const createPages = async (
  { graphql, cache, actions: { createNode } },
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

  await cache.set(`gatsby-plugin-local-search___${name}___index`, index)
  await cache.set(`gatsby-plugin-local-search___${name}___store`, store)

  return
}

export const createResolvers = async (
  { createResolvers, cache },
  { name, engine },
) => {
  createResolvers({
    Query: {
      [lowerFirst(generateTypeName(name))]: {
        type: 'LocalSearchIndex',
        resolve: async (_parent, _args, context) => {
          const index = await cache.get(
            `gatsby-plugin-local-search___${name}___index`,
          )

          const store = await cache.get(
            `gatsby-plugin-local-search___${name}___store`,
          )

          return {
            id: name,
            engine,
            index,
            store,
          }
        },
      },
    },
  })

  return
}

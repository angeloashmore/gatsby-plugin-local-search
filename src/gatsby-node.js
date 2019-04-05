import createNodeHelpers from 'gatsby-node-helpers'
import lunr from 'lunr'
import FlexSearch from 'flexsearch'
import * as R from 'ramda'
import lowerFirst from 'lodash.lowerfirst'

const TYPE_PREFIX = 'LocalSearch'
const TYPE_INDEX = 'Index'
const TYPE_STORE = 'Store'

const { generateTypeName, generateNodeId } = createNodeHelpers({
  typePrefix: TYPE_PREFIX,
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
const createIndexExport = ({ reporter, name, engine, ...args }) => {
  switch (engine) {
    case 'flexsearch':
      return createFlexSearchIndexExport(args)

    case 'lunr':
      return createLunrIndexExport(args)

    default:
      reporter.error(
        `The gatsby-plugin-local-search engine option for index "${name}" is invalid. Must be one of: flexsearch, lunr. The index will be null.`,
      )

      return null
  }
}

// Create index and store during createPages and save to cache. The cached
// values will be used in createResolvers.
export const createPages = async (
  { graphql, cache, reporter },
  { name, ref = 'id', store: storeFields, query, normalizer, engine },
) => {
  const result = await graphql(query)
  if (result.errors) throw R.head(result.errors)

  const documents = await Promise.resolve(normalizer(result))
  if (R.isEmpty(documents))
    reporter.warn(
      `The gatsby-plugin-local-search query for index "${name}" returned no nodes. The index and store will be empty.`,
    )

  const fields = R.pipe(
    R.head,
    R.keys,
    R.reject(R.equals(ref)),
  )(documents)

  const index = createIndexExport({
    reporter,
    name,
    engine,
    documents,
    fields,
    ref,
  })

  // Default to all fields if storeFields is not provided
  const store = R.pipe(
    R.map(R.pick(storeFields || [...fields, ref])),
    R.indexBy(R.prop(ref)),
  )(documents)

  // Save to cache to use later in GraphQL resolver.
  await cache.set(generateNodeId(TYPE_INDEX, name), index)
  await cache.set(generateNodeId(TYPE_STORE, name), store)

  return
}

// Set the GraphQL type for LocalSearchIndex.
export const sourceNodes = ({ actions: { createTypes }, schema }, { name }) => {
  createTypes([
    schema.buildObjectType({
      name: generateTypeName(`${TYPE_INDEX} ${name}`),
      fields: {
        id: 'ID',
        engine: 'String',
        index: 'String',
        store: 'String',
      },
    }),
  ])
}

export const createResolvers = async (
  { actions: { createTypes }, createResolvers, cache, schema },
  { name, engine },
) => {
  createResolvers({
    Query: {
      [lowerFirst(generateTypeName(name))]: {
        type: generateTypeName(`${TYPE_INDEX} ${name}`),
        resolve: async (_parent, _args, context) => {
          const index = await cache.get(generateNodeId(TYPE_INDEX, name))
          const store = await cache.get(generateNodeId(TYPE_STORE, name))

          return {
            id: name,
            engine,
            index,
            store: JSON.stringify(store),
          }
        },
      },
    },
  })

  return
}

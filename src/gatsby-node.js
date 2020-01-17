import lunr from 'lunr'
import FlexSearch from 'flexsearch'
import * as R from 'ramda'
import lowerFirst from 'lodash.lowerfirst'
import pascalcase from 'pascalcase'

const TYPE_PREFIX = 'LocalSearch'
const TYPE_INDEX = 'Index'
const TYPE_STORE = 'Store'

// Returns an exported FlexSearch index using the provided documents, fields,
// and ref.
const createFlexSearchIndexExport = ({ documents, ref, engineOptions }) => {
  const index = FlexSearch.create.apply(
    null,
    Array.isArray(engineOptions) ? engineOptions : [engineOptions],
  )

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
export const createPages = async (gatsbyContext, pluginOptions) => {
  const { graphql, cache, reporter, createNodeId } = gatsbyContext
  const {
    name,
    ref = 'id',
    store: storeFields,
    query,
    normalizer,
    engine,
    engineOptions,
  } = pluginOptions

  const result = await graphql(query)
  if (result.errors) throw R.head(result.errors)

  const documents = await Promise.resolve(normalizer(result))
  if (R.isEmpty(documents))
    reporter.warn(
      `The gatsby-plugin-local-search query for index "${name}" returned no nodes. The index and store will be empty.`,
    )

  const fields = R.pipe(R.head, R.keys, R.reject(R.equals(ref)))(documents)

  const index = createIndexExport({
    reporter,
    name,
    engine,
    engineOptions,
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
  await cache.set(createNodeId(`${TYPE_INDEX} ${name}`), index)
  await cache.set(createNodeId(`${TYPE_STORE} ${name}`), store)

  return
}

// Set the GraphQL type for LocalSearchIndex.
export const createSchemaCustomization = (gatsbyContext, pluginOptions) => {
  const { actions, schema } = gatsbyContext
  const { createTypes } = actions
  const { name } = pluginOptions

  createTypes([
    schema.buildObjectType({
      name: pascalcase(`${TYPE_PREFIX} ${TYPE_INDEX} ${name}`),
      fields: {
        id: 'ID',
        engine: 'String',
        index: 'String',
        store: 'String',
      },
    }),
  ])
}

export const createResolvers = async (gatsbyContext, pluginOptions) => {
  const { createResolvers, cache, createNodeId } = gatsbyContext
  const { name, engine } = pluginOptions

  createResolvers({
    Query: {
      [lowerFirst(pascalcase(`${TYPE_PREFIX} ${name}`))]: {
        type: pascalcase(`${TYPE_PREFIX} ${TYPE_INDEX} ${name}`),
        resolve: async () => {
          const index = await cache.get(createNodeId(`${TYPE_INDEX} ${name}`))
          const store = await cache.get(createNodeId(`${TYPE_STORE} ${name}`))

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

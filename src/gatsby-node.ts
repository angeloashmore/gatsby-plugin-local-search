import lunr from 'lunr'
import FlexSearch from 'flexsearch'
import {
  GatsbyNode,
  CreatePagesArgs,
  CreateSchemaCustomizationArgs,
  CreateResolversArgs,
} from 'gatsby'
import { pick, lowerFirst } from 'lodash'
import { pascalCase } from 'pascal-case'

import {
  IndexableDocument,
  NodeType,
  PluginOptions,
  Store,
  LocalSearchNodeInput,
  PartialContext,
} from './types'

const DEFAULT_REF = 'id'

const createFlexSearchIndexExport = (
  documents: IndexableDocument[],
  pluginOptions: PluginOptions,
): string => {
  const { ref = DEFAULT_REF, index: indexFields, engineOptions } = pluginOptions

  const index = FlexSearch.create<IndexableDocument>(engineOptions)

  documents.forEach((doc) => {
    const serializedDoc = JSON.stringify(
      indexFields ? pick(doc, indexFields) : doc,
    )
    // Using "as number" due to FlexSearch's types, but it could technically be
    // a string as well.
    index.add(doc[ref] as number, serializedDoc)
  })

  return index.export()
}

const createLunrIndexExport = (
  documents: IndexableDocument[],
  pluginOptions: PluginOptions,
): string => {
  const { ref = DEFAULT_REF, index: indexFields } = pluginOptions

  const fields =
    indexFields ?? documents.length > 0 ? Object.keys(documents[0]) : []

  const index = lunr(function () {
    this.ref(ref)
    fields.forEach((field) => this.field(field))
    documents.forEach((doc) => this.add(doc))
  })

  return JSON.stringify(index)
}

const createIndexExport = (
  documents: IndexableDocument[],
  pluginOptions: PluginOptions,
  gatsbyContext: CreatePagesArgs,
): string | void => {
  const { reporter } = gatsbyContext
  const { name, engine } = pluginOptions

  switch (engine) {
    case 'flexsearch':
      return createFlexSearchIndexExport(documents, pluginOptions)

    case 'lunr':
      return createLunrIndexExport(documents, pluginOptions)

    default:
      reporter.error(
        `The engine option for index "${name}" is invalid. It must be one of: flexsearch, lunr. The index will not be created.`,
      )
  }
}

// Callback style is necessary since createPages cannot be async or return a
// Promise. At least, that's what GatsbyNode['createNodes'] says.
export const createPages = async (
  gatsbyContext: CreatePagesArgs,
  pluginOptions: PluginOptions,
): Promise<void> => {
  const {
    actions,
    graphql,
    reporter,
    createNodeId,
    createContentDigest,
  } = gatsbyContext
  const { createNode } = actions
  const {
    name,
    engine,
    ref = DEFAULT_REF,
    store: storeFields,
    query,
    normalizer,
  } = pluginOptions

  const result = await graphql(query)

  if (result.errors) {
    reporter.error(
      'The provided GraphQL query contains errors. The index will not be created.',
      result.errors[0],
    )
    return
  }

  const documents = (await Promise.resolve(normalizer(result))) || []

  if (documents.length < 1)
    reporter.warn(
      `The query for index "${name}" returned no nodes. The index and store will be empty.`,
    )

  const filteredDocuments = documents.filter(
    (doc) => doc[ref] !== undefined && doc[ref] !== null,
  )

  const index = createIndexExport(
    filteredDocuments,
    pluginOptions,
    gatsbyContext,
  )
  if (!index) return

  const store = filteredDocuments.reduce((acc, doc) => {
    acc[String(doc[ref])] = storeFields ? pick(doc, storeFields) : doc

    return acc
  }, {} as Store)

  const nodeType = pascalCase(`${NodeType.LocalSearch} ${name}`)
  const nodeId = createNodeId(name)

  const node: LocalSearchNodeInput = {
    id: nodeId,
    name,
    engine,
    index,
    store,
    internal: {
      type: nodeType,
      contentDigest: createContentDigest({ index, store }),
    },
  }

  createNode(node)
}

export const createSchemaCustomization: NonNullable<
  GatsbyNode['createSchemaCustomization']
> = async (
  gatsbyContext: CreateSchemaCustomizationArgs,
  pluginOptions: PluginOptions,
) => {
  const { actions, schema } = gatsbyContext
  const { createTypes } = actions
  const { name } = pluginOptions

  const nodeType = pascalCase(`${NodeType.LocalSearch} ${name}`)

  createTypes([
    schema.buildObjectType({
      name: nodeType,
      fields: {
        id: 'ID!',
        name: 'String!',
        engine: 'String!',
        index: 'String!',
        store: 'JSON!',
      },
    }),
  ])
}

export const createResolvers: NonNullable<
  GatsbyNode['createResolvers']
> = async (
  gatsbyContext: CreateResolversArgs,
  pluginOptions: PluginOptions,
) => {
  const { createResolvers, createNodeId } = gatsbyContext
  const { name } = pluginOptions

  const nodeType = pascalCase(`${NodeType.LocalSearch} ${name}`)
  const nodeId = createNodeId(name)

  createResolvers({
    Query: {
      [lowerFirst(nodeType)]: {
        type: nodeType,
        resolve: (_source: unknown, _args: unknown, context: PartialContext) =>
          context.nodeModel.getNodeById({ id: nodeId }),
      },
    },
  })
}

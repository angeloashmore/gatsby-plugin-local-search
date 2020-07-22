import { CreatePagesArgs, CreateSchemaCustomizationArgs } from 'gatsby'
import lunr from 'lunr'
import FlexSearch from 'flexsearch'

import { createPages, createSchemaCustomization } from '../src/gatsby-node'
import { PluginOptions } from '../src/types'

const mockQueryResult = {
  data: {
    allNode: {
      nodes: [
        { id: 'id1', foo: 'bar' },
        { id: 'id2', foo: 'needle' },
        // Without valid ref field.
        { id: undefined, foo: 'baz' },
      ],
    },
  },
} as const

const pluginOptions: PluginOptions = {
  name: 'name',
  engine: 'flexsearch',
  query: 'query',
  normalizer: (input) =>
    (input as typeof mockQueryResult).data.allNode.nodes.map((node) => ({
      id: node.id,
      foo: node.foo,
    })),
  plugins: [] as unknown[],
}

beforeEach(() => jest.clearAllMocks())

describe('createPages', () => {
  const mockGatsbyContext: CreatePagesArgs & {
    traceId: 'initial-createPages'
  } = {
    // @ts-expect-error Partial actions
    actions: { createNode: jest.fn() },
    // @ts-expect-error Partial reporter
    reporter: { warn: jest.fn(), error: jest.fn() },
    createNodeId: jest.fn().mockReturnValue('createNodeId'),
    createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
    graphql: jest.fn().mockReturnValue(Promise.resolve(mockQueryResult)),
  }

  describe('with flexsearch engine', () => {
    test('creates index', async () => {
      await createPages(mockGatsbyContext, pluginOptions)

      const createNode = mockGatsbyContext.actions.createNode as jest.Mock
      const node = createNode.mock.calls[0][0]
      const exportedIndex = node.index
      const index = FlexSearch.create()
      index.import(exportedIndex)

      expect(mockGatsbyContext.actions.createNode).toMatchSnapshot()
      expect(index.search('needle')).toMatchSnapshot()
    })

    test('passes engine options', async () => {
      const spy = jest.spyOn(FlexSearch, 'create')
      const engineOptions = { rtl: true }

      await createPages(mockGatsbyContext, { ...pluginOptions, engineOptions })

      expect(spy).toHaveBeenCalledWith(engineOptions)
      spy.mockRestore()
    })
  })

  describe('with lunr engine', () => {
    test('creates index', async () => {
      await createPages(mockGatsbyContext, { ...pluginOptions, engine: 'lunr' })

      const createNode = mockGatsbyContext.actions.createNode as jest.Mock
      const node = createNode.mock.calls[0][0]
      const exportedIndex = node.index
      const index = lunr.Index.load(JSON.parse(exportedIndex))

      expect(mockGatsbyContext.actions.createNode).toMatchSnapshot()
      expect(index.search('needle')).toMatchSnapshot()
    })
  })
})

describe('createSchemaCustomization', () => {
  const mockGatsbyContext: CreateSchemaCustomizationArgs = {
    // @ts-expect-error Partial actions
    actions: { createTypes: jest.fn() },
    // @ts-expect-error Partial schema
    schema: {
      buildObjectType: jest
        .fn()
        .mockImplementation((config) => ({ kind: 'OBJECT', config })),
    },
  }

  test('creates types', async () => {
    await createSchemaCustomization(mockGatsbyContext, pluginOptions)

    expect(mockGatsbyContext.actions.createTypes).toMatchSnapshot()
  })
})

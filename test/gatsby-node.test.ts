import { CreatePagesArgs } from 'gatsby'
import lunr from 'lunr'
import FlexSearch from 'flexsearch'

import { createPages } from '../src/gatsby-node'

const mockActions = {
  deletePage: jest.fn(),
  createPage: jest.fn(),
  deleteNode: jest.fn(),
  deleteNodes: jest.fn(),
  createNode: jest.fn(),
  touchNode: jest.fn(),
  createNodeField: jest.fn(),
  createParentChildLink: jest.fn(),
  setWebpackConfig: jest.fn(),
  replaceWebpackConfig: jest.fn(),
  setBabelOptions: jest.fn(),
  setBabelPlugin: jest.fn(),
  setBabelPreset: jest.fn(),
  createJob: jest.fn(),
  createJobV2: jest.fn(),
  setJob: jest.fn(),
  endJob: jest.fn(),
  setPluginStatus: jest.fn(),
  createRedirect: jest.fn(),
  addThirdPartySchema: jest.fn(),
  createTypes: jest.fn(),
  createFieldExtension: jest.fn(),
}

const mockGatsbyContext: CreatePagesArgs & {
  traceId: 'initial-createPages'
} = {
  pathPrefix: 'pathPrefix',
  boundActionCreators: mockActions,
  actions: mockActions,
  loadNodeContent: jest.fn(),
  store: {
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    getState: jest.fn(),
    replaceReducer: jest.fn(),
  },
  emitter: {
    addListener: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    removeListener: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    getMaxListeners: jest.fn(),
    listeners: jest.fn(),
    rawListeners: jest.fn(),
    emit: jest.fn(),
    eventNames: jest.fn(),
    listenerCount: jest.fn(),
  },
  getNodes: jest.fn(),
  getNode: jest.fn(),
  getNodesByType: jest.fn(),
  hasNodeChanged: jest.fn(),
  reporter: {
    stripIndent: jest.fn(),
    // @ts-ignore
    format: jest.fn(),
    setVerbose: jest.fn(),
    setNoColor: jest.fn(),
    // @ts-ignore
    panic: jest.fn().mockImplementation((msg: string | Error, err?: Error) => {
      throw err ?? msg
    }),
    panicOnBuild: jest
      .fn()
      .mockImplementation((msg: string | Error, err?: Error) => {
        throw err ?? msg
      }),
    error: jest.fn(),
    uptime: jest.fn(),
    success: jest.fn(),
    verbose: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    activityTimer: jest.fn().mockReturnValue({
      start: jest.fn(),
      end: jest.fn(),
    }),
    createProgress: jest.fn(),
  },
  getNodeAndSavePathDependency: jest.fn(),
  cache: {
    set: jest.fn(),
    get: jest.fn(),
  },
  createNodeId: jest.fn().mockReturnValue('createNodeId'),
  createContentDigest: jest.fn().mockReturnValue('createContentDigest'),
  tracing: {
    tracer: {},
    parentSpan: {},
    startSpan: jest.fn(),
  },
  parentSpan: {},
  schema: {
    buildObjectType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'OBJECT', config })),
    buildUnionType: jest.fn().mockImplementation((config) => ({
      kind: 'UNION',
      config,
    })),
    buildInterfaceType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'INTERFACE', config })),
    buildInputObjectType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'INPUT', config })),
    buildEnumType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'ENUM', config })),
    buildScalarType: jest
      .fn()
      .mockImplementation((config) => ({ kind: 'SCALAR', config })),
  },
  graphql: jest.fn(),
}

const mockQueryResult = {
  data: {
    allNode: {
      edges: [
        { id: 'id1', foo: 'bar' },
        { id: 'id2', foo: 'needle' },
        // Without valid ref field.
        { id: undefined, foo: 'baz' },
      ],
    },
  },
} as const

const pluginOptions = {
  name: 'name',
  engine: 'flexsearch',
  query: 'query',
  normalizer: ({ data }: typeof mockQueryResult) =>
    data.allNode.edges.map((node) => ({
      id: node.id,
      foo: node.foo,
    })),
  plugins: [],
}

beforeAll(() => {
  ;(mockGatsbyContext.graphql as jest.Mock).mockReturnValue(
    Promise.resolve(mockQueryResult),
  )
})

describe('createPages', () => {
  beforeEach(() => jest.clearAllMocks())

  test('creates types', async () => {
    await new Promise((res) =>
      createPages(mockGatsbyContext, pluginOptions, res),
    )

    expect(mockGatsbyContext.actions.createTypes).toMatchSnapshot()
  })

  describe('with flexsearch engine', () => {
    test('creates index', async () => {
      await new Promise((res) =>
        createPages(mockGatsbyContext, pluginOptions, res),
      )

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
      const engineOptions = { foo: 'bar' }

      await new Promise((res) =>
        createPages(
          mockGatsbyContext,
          { ...pluginOptions, engineOptions },
          res,
        ),
      )

      expect(spy).toHaveBeenCalledWith(engineOptions)
      spy.mockRestore()
    })
  })

  describe('with lunr engine', () => {
    test('creates index', async () => {
      await new Promise((res) =>
        createPages(
          mockGatsbyContext,
          { ...pluginOptions, engine: 'lunr' },
          res,
        ),
      )

      const createNode = mockGatsbyContext.actions.createNode as jest.Mock
      const node = createNode.mock.calls[0][0]
      const exportedIndex = node.index
      const index = lunr.Index.load(JSON.parse(exportedIndex))

      expect(mockGatsbyContext.actions.createNode).toMatchSnapshot()
      expect(index.search('needle')).toMatchSnapshot()
    })
  })
})

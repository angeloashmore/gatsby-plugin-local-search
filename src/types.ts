import { PluginOptions as GatsbyPluginOptions, NodeInput } from 'gatsby'
import { CreateOptions as FlexSearchCreateOptions } from 'flexsearch'

export type IndexableDocument = Record<string, unknown>

export type Store = Record<string, unknown>

export enum NodeType {
  LocalSearch = 'LocalSearch',
}

export type Engine = 'flexsearch' | 'lunr'

export interface LocalSearchNodeInput extends NodeInput {
  name: string
  engine: Engine
  index: string
  store: Store
}

interface NormalizerInput {
  errors?: unknown
  data?: unknown
}

export interface PluginOptions extends GatsbyPluginOptions {
  name: string
  engine: Engine
  engineOptions?: FlexSearchCreateOptions
  ref?: string
  index?: string[]
  store?: string[]
  query: string
  normalizer: (input: NormalizerInput) => IndexableDocument[]
}

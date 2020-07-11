import { PluginOptions as GatsbyPluginOptions } from 'gatsby'
import { CreateOptions as FlexSearchCreateOptions } from 'flexsearch'

export type IndexableDocument = Record<string, unknown>

export type Store = Record<string, unknown>

export enum NodeType {
  LocalSearch = 'LocalSearch',
}

export type Engine = 'flexsearch' | 'lunr'

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

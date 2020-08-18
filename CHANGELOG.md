# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v2.0.0-next.6...v2.0.0) (2020-08-18)

## [2.0.0-next.6](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v2.0.0-next.5...v2.0.0-next.6) (2020-07-22)


### Features

* add publicIndexURL and publicStoreURL ([8ed9a0e](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/8ed9a0e5dc0b254356e278ae5026822d8e2cdae0)), closes [#24](https://github.com/angeloashmore/gatsby-plugin-local-search/issues/24)


### Bug Fixes

* add Node interface to node ([88878e5](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/88878e5543b883aae82b7ef310ad71c8d8e8e33d))

## [2.0.0-next.5](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v2.0.0-next.4...v2.0.0-next.5) (2020-07-11)


### Bug Fixes

* restore resolver ([dc7dc87](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/dc7dc8792e02409686405189dd8074fbce03b1f8))

## [2.0.0-next.4](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v2.0.0-next.3...v2.0.0-next.4) (2020-07-11)


### Bug Fixes

* move createTypes to createSchemaCustomization ([1195fa5](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/1195fa527fc11f9e2fb35c0323d5227f826dc7cb))

## [2.0.0-next.3](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v2.0.0-next.2...v2.0.0-next.3) (2020-07-11)


### Bug Fixes

* move createTypes to sourceNodes ([2ae2a8f](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/2ae2a8fd416a3db26b59ad17eb8ddd60f19c6ab6))

## [2.0.0-next.2](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v2.0.0-next.1...v2.0.0-next.2) (2020-07-11)


### Bug Fixes

* only export Gatsby APIs in gatsby-node ([93eaac2](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/93eaac263012ae16f77be4badf6540a4f2b06a89))

## [2.0.0-next.1](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v2.0.0-next.0...v2.0.0-next.1) (2020-07-11)

## [2.0.0-next.0](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v1.1.1...v2.0.0-next.0) (2020-07-11)


### ⚠ BREAKING CHANGES

* The `store` field now returns a JSON object rather than a String. You will likely need to remove `JSON.parse` from wherever `store` is being used.

For example, when using `react-use-flexsearch`:

```js
// Before
useFlexSearch('query', index, JSON.parse(store))

// After
useFlexSearch('query', index, store)
```

### Features

* return store as JSON ([#15](https://github.com/angeloashmore/gatsby-plugin-local-search/issues/15)) ([fcd5b69](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/fcd5b69b39f6cca7ffcb1a31f5550c8658b0ca76))

### [1.1.1](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v1.1.0...v1.1.1) (2020-02-28)


### Features

* safely set default normalizer fields ([f8f63d2](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/f8f63d2f3bdcdbc8b233eed3a5846f9754836d78))

## [1.1.0](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v1.0.0...v1.1.0) (2020-01-17)


### Features

* use `index` option to filter indexed fields ([aed3fc3](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/aed3fc3ad61d30c899b5cca7e5d4d0df7fd1864a))


### Bug Fixes

* update deep dependencies ([cfc70e1](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/cfc70e10fb3e4455e0e6c18390b24f5188733b1e))
* update dependencies ([84e5141](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/84e5141aa7fa74f5740567e30706e38a6342123e))

# [1.0.0](https://github.com/angeloashmore/gatsby-plugin-local-search/compare/v0.1.4...v1.0.0) (2019-07-08)


### Bug Fixes

* change to onPreBootstrap to avoid node creation warning ([a5b2c1b](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/a5b2c1b))
* improve reporter messages ([5310a93](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/5310a93))
* include ref in default store fields ([c827d5c](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/c827d5c))
* readme ([19d8a13](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/19d8a13))
* update react-use-flexsearch link in readme.md ([53feeca](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/53feeca))
* use dedicated schema customization hook ([d5f192e](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/d5f192e))
* use ids for flexsearch index ([6401dd9](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/6401dd9))


### Features

* add multiple engines support ([2eb5b6c](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/2eb5b6c))
* add namepsaced node type ([cba59cc](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/cba59cc))
* change store to string (temporary) ([3f1e819](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/3f1e819))
* compat with gatsby >=2.2.0 ([d0da6f1](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/d0da6f1))
* upgrade dependencies and add conventional commits ([#1](https://github.com/angeloashmore/gatsby-plugin-local-search/issues/1)) ([88d7247](https://github.com/angeloashmore/gatsby-plugin-local-search/commit/88d7247))

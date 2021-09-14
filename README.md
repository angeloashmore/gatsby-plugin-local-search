# gatsby-plugin-local-search

Gatsby plugin for providing client-side search for data available in Gatsby's
GraphQL layer using a variety of engines.

The following engines are supported:

- [FlexSearch][flexsearch] (fastest, recommended)
- [Lunr][lunr]

This plugin provides a search index and store using the selected engine. To
display search results, pair the index and store with a compatible React hook or
component. See [Displaying the search results](#displaying-the-search-results).

## Install

`npm install --save gatsby-plugin-local-search`

## How to use

```javascript
// gatsby-config.js

module.exports = {
  plugins: [
    // You can have multiple instances of this plugin to create indexes with
    // different names or engines. For example, multi-lingual sites could create
    // an index for each language.
    {
      resolve: 'gatsby-plugin-local-search',
      options: {
        // A unique name for the search index. This should be descriptive of
        // what the index contains. This is required.
        name: 'pages',

        // Set the search engine to create the index. This is required.
        // The following engines are supported: flexsearch, lunr
        engine: 'flexsearch',

        // Provide options to the engine. This is optional and only recommended
        // for advanced users.
        //
        // Note: Only the flexsearch engine supports options.
        engineOptions: 'default',

        // GraphQL query used to fetch all data for the search index. This is
        // required.
        query: `
          {
            allMarkdownRemark {
              nodes {
                id
                frontmatter {
                  path
                  title
                }
                rawMarkdownBody
              }
            }
          }
        `,

        // Field used as the reference value for each document.
        // Default: 'id'.
        ref: 'id',

        // List of keys to index. The values of the keys are taken from the
        // normalizer function below.
        // Default: all fields
        index: ['title', 'body'],

        // List of keys to store and make available in your UI. The values of
        // the keys are taken from the normalizer function below.
        // Default: all fields
        store: ['id', 'path', 'title'],

        // Function used to map the result from the GraphQL query. This should
        // return an array of items to index in the form of flat objects
        // containing properties to index. The objects must contain the `ref`
        // field above (default: 'id'). This is required.
        normalizer: ({ data }) =>
          data.allMarkdownRemark.nodes.map((node) => ({
            id: node.id,
            path: node.frontmatter.path,
            title: node.frontmatter.title,
            body: node.rawMarkdownBody,
          })),
      },
    },
  ],
}
```

## How to query

A new node type becomes available named `localSearch${name}`, where `${name}` is
the name provided in the options. In the above example, the node would be
accessed with `localSearchPages`.

The search index and store are made available as fields on the node.

- **`index`**: (String) The search index created using the engine selected in
  the plugin options.
- **`store`**: (JSON) The store used to map a search result's `ref` key to data.

Note that `store` is an object but does not require you to explicitly query each
field.

```graphql
{
  localSearchPages {
    index
    store
  }
}
```

### Lazy-loading the index and/or store

The index and store can become large depending on the number of documents and
their fields. To reduce your bundle size and delay fetching these pieces of data
until needed, you can query a URL for both the index and store like the
following.

```graphql
{
  localSearchPages {
    publicIndexURL
    publicStoreURL
  }
}
```

Both `publicIndexURL` and `publicStoreURL` will return a public URL that can be
fetched at run-time. For example, you could call `fetch` with the URLs to load
the data in the background only as the user focuses your interface's search
input.

The files contain data identical to querying for `index` and `store` directly
and will be saved in your site's `/public` folder. This functionality if very
similar to `gatsby-source-filesystem`'s `publicURL` field.

## FlexSearch Options

The `engineOptions` config allows you to change the FlexSearch Index options.
These are detailed extensively in the [FlexSearch Documentation](https://github.com/nextapps-de/flexsearch#options),
including all the available keys and their valid values.

It accepts a single string matching one of the presets, or an object containing
the available keys and their valid settings as listed in the FlexSearch documentation.

These options give you a high degree of customisation, but changes from the defaults 
can definitely affect performance. The FlexSearch Documentation has extensive details on
performance impacts of various settings, as well as their effects. 

They generally recommend using the presets as a starting point and appling further custom configuration 
to get the best out for your situation.

One useful example is turning on 'fuzzy' matching by changing the tokeniser to one of
the other options, such as 'forward': `engineOptions: { tokenize: "forward" },`

Here are the same examples as listed in [FlexSearch Useage](https://github.com/nextapps-de/flexsearch#usage),
and how you would define them with `engineOptions`:

#### Create a new index (using only defaults)

```js
engineOptions: '',
```

#### Create a new index and choosing one of the presets:

```js
engineOptions: 'performance',
```

#### Create a new index with custom options:

```js
engineOptions: {
    charset: "latin:extra",
    tokenize: "reverse",
    resolution: 9
},
```

#### Create a new index and extend a preset with custom options:

```js
engineOptions: {
    preset: "memory",
    tokenize: "forward",
    resolution: 5
},
```

## Displaying the search results

This plugin provides a search index and store object but leaves presentation and
search functionality up to you.

The following React components/hooks are recommended pairings:

- **FlexSearch**: [`react-use-flexsearch`][react-use-flexsearch] (hook)
- **Lunr**: [`react-lunr`][react-lunr] (hook)

[flexsearch]: https://github.com/nextapps-de/flexsearch
[lunr]: https://lunrjs.com/
[react-use-flexsearch]: https://github.com/angeloashmore/react-use-flexsearch
[react-lunr]: https://github.com/angeloashmore/react-lunr

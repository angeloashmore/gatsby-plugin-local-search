# gatsby-plugin-local-search

Gatsby plugin for providing client-side search for data available in Gatsby's
GraphQL layer using [Lunr][lunr].

[react-lunr][react-lunr] is a compatible React component to query the generated
search index and render your results.

## Install

`npm install --save gatsby-plugin-local-search`

## How to use

```js
// gatsby-config.js

module.exports = {
  plugins: [
    // You can have multiple instances of this plugin to create indexes with
    // different names. For example, multi-lingual sites could create an index
    // for each language.
    {
      resolve: 'gatsby-plugin-local-search',
      options: {
        name: 'pages',
        query: `
          {
            allMarkdownRemark {
              edges {
                node {
                  id
                  frontmatter {
                    path
                    title
                  }
                  rawMarkdownBody
                }
              }
            }
          }
        `,
        store: ['id', 'path', 'title'],
        normalizer: ({ data }) =>
          data.allMarkdownRemark.edges.map(({ node }) => ({
            id: node.id,
            path: node.frontmatter.path,
            title: node.frontmatter.title,
            body: node.rawMarkdownBody
          }))
      },
    },
  ],
}
```

## How to query

A new node type becomes available named `localSearch${name}`, where `${name}`
is the name provided in the options. In the above example, the node would be
accessed with `localSearchPages`.

The Lunr index and store are made available as fields on the node. Both are
large strings that can be run through `JSON.parse` as necessary.

```graphql
{
  localSearchPages {
    index
    store
  }
}
```

## Displaying the search results

This plugin provides a Lunr index and store object, but leaves presentation and
Lunr search functionality up to you.

If you are looking for a pre-made React component that can handle search, but
let you define your own UI, [`react-lunr`][react-lunr] is a great option
(disclosure: I wrote the component for this plugin);

[lunr]: https://lunrjs.com/
[react-lunr]: https://github.com/angeloashmore/react-lunr

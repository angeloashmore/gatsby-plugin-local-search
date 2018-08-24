import React from 'react'
import PropTypes from 'prop-types'
import lunr from 'lunr'
import memoize from 'memoize-one'

export class LocalSearch extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    index: PropTypes.string.isRequired,
    store: PropTypes.string.isRequired,
    initialQuery: PropTypes.string,
  }

  static defaultProps = {
    initialQuery: '',
  }

  constructor(props) {
    super(props)

    this.state = {
      query: props.initialQuery,
    }

    this.index = lunr.Index.load(JSON.parse(props.index))
    this.store = JSON.parse(props.store)
  }

  setQuery = query => this.setState({ query })

  search = memoize(query => {
    if (!query) return []

    const results = this.index.search(query)

    return results.map(({ ref }) => this.store[ref])
  })

  render() {
    return this.props.children({
      setQuery: this.setQuery,
      results: this.search(this.state.query),
    })
  }
}

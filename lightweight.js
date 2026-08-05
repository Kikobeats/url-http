'use strict'

module.exports = url => {
  try {
    const { href, protocol } = new URL(url)
    return (protocol === 'http:' || protocol === 'https:') && href
  } catch {
    return false
  }
}

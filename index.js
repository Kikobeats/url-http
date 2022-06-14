'use strict'

const URLConstructor = typeof URL === 'function' ? URL : require('url').URL

const urlRegex = require('url-regex-safe')({
  apostrophes: true,
  exact: true,
  parens: true
})

const REGEX_HTTP_PROTOCOL = /^https?:\/\//i

module.exports = url => {
  try {
    const { href } = new URLConstructor(url)
    return REGEX_HTTP_PROTOCOL.test(href) && urlRegex.test(href) && href
  } catch (err) {
    return false
  }
}

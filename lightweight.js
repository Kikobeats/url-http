'use strict'

const REGEX_HTTP_PROTOCOL = /^https?:\/\//i

module.exports = url => {
  try {
    const { href } = new URL(url)
    return REGEX_HTTP_PROTOCOL.test(href) && href
  } catch (err) {
    return false
  }
}

'use strict'

const URL = globalThis ? globalThis.URL : require('url').URL
const urlRegex = require('url-regex-safe')

const REGEX_HTTP_PROTOCOL = /^https?:\/\//i

module.exports = url => {
  try {
    const { href, hostname } = new URL(url)
    const isIPv6 = hostname.startsWith('[') && hostname.endsWith(']')
    return (
      REGEX_HTTP_PROTOCOL.test(href) &&
      urlRegex({ apostrophes: true, exact: !isIPv6, parens: true }).test(
        href
      ) &&
      href
    )
  } catch (_) {
    return false
  }
}

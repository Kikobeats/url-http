'use strict'

const urlRegex = require('url-regex-safe')

const REGEX_HTTP_PROTOCOL = /^https?:\/\//i

module.exports = url => {
  try {
    const { href, hostname, origin, username, password } = new URL(url)
    if (!REGEX_HTTP_PROTOCOL.test(href) || username || password) return false
    // url-regex-safe cannot exact-match IPv6 authorities.
    const exact = !(hostname.startsWith('[') && hostname.endsWith(']'))

    // url-regex-safe's TLD list has no xn-- entries, so an IDN TLD has to be
    // supplied; an ASCII one stays subject to the built-in public-suffix list.
    const tld = hostname.slice(hostname.lastIndexOf('.') + 1)
    const tlds = tld.startsWith('xn--') ? [tld] : undefined

    const regex = urlRegex({ apostrophes: true, exact, parens: true, tlds })
    if (!regex.test(href)) return false

    regex.lastIndex = 0

    // Unanchored matching also succeeds on a URL-looking substring in the path,
    // leaving the authority unchecked (`http://internal/https://example.com/`).
    if (!exact && !regex.test(`${origin}/`)) return false

    return href
  } catch (_) {
    return false
  }
}

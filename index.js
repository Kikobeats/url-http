'use strict'

const punycodeRegex = require('punycode-regex')()
const urlRegex = require('url-regex-safe')

const REGEX_HTTP_PROTOCOL = /^https?:\/\//i

module.exports = url => {
  try {
    const { href, hostname, origin, username, password } = new URL(url)
    if (!REGEX_HTTP_PROTOCOL.test(href) || username || password) return false
    const isIPv6 = hostname.startsWith('[') && hostname.endsWith(']')
    const isPunycode = punycodeRegex.test(hostname)
    // url-regex-safe cannot exact-match IPv6 or punycode authorities.
    const exact = !isIPv6 && !isPunycode

    const tlds = isPunycode ? [] : undefined
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

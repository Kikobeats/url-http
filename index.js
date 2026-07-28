'use strict'

const punycodeRegex = require('punycode-regex')()
const urlRegex = require('url-regex-safe')

const REGEX_HTTP_PROTOCOL = /^https?:\/\//i

module.exports = url => {
  try {
    const parsed = new URL(url)
    const { href, hostname, username, password } = parsed
    if (!REGEX_HTTP_PROTOCOL.test(href) || username || password) return false
    const isIPv6 = hostname.startsWith('[') && hostname.endsWith(']')
    const isPunycode = punycodeRegex.test(hostname)
    // Text fragments match with exact:true. Only IPv6 / punycode need
    // unanchored matching (url-regex-safe does not exact-match those forms).
    const exact = !isIPv6 && !isPunycode

    const tlds = isPunycode ? [] : undefined
    const options = { apostrophes: true, exact, parens: true, tlds }
    if (!urlRegex(options).test(href)) return false

    // Unanchored matching can succeed on a URL-looking path substring while
    // the authority itself is not a valid HTTP URL (e.g. single-label host
    // `http://internal/https://example.com/`). Require the origin to match too.
    if (!exact) {
      const authorityHref = `${parsed.origin}/`
      if (!urlRegex({ ...options, exact: false }).test(authorityHref)) {
        return false
      }
    }

    return href
  } catch (_) {
    return false
  }
}

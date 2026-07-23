'use strict'

const punycodeRegex = require('punycode-regex')()
const urlRegex = require('url-regex-safe')

const REGEX_HTTP_PROTOCOL = /^https?:\/\//i

module.exports = url => {
  try {
    const { href, hostname, hash, username, password } = new URL(url)
    if (!REGEX_HTTP_PROTOCOL.test(href)) return false
    // Reject credentialed URLs explicitly. When `exact` is false (IPv6,
    // punycode, text fragments), url-regex-safe can match a substring after
    // `@` while we still return the original href — which would otherwise
    // accept userinfo that the exact-match path rejects.
    if (username || password) return false
    const isIPv6 = hostname.startsWith('[') && hostname.endsWith(']')
    const isPunycode = punycodeRegex.test(hostname)
    const hasTextFragment = hash.startsWith('#:~:text=')
    const exact = !isIPv6 && !isPunycode && !hasTextFragment

    const tlds = isPunycode ? [] : undefined
    return (
      urlRegex({ apostrophes: true, exact, parens: true, tlds }).test(href) &&
      href
    )
  } catch (_) {
    return false
  }
}

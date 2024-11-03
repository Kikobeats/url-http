'use strict'

const punycodeRegex = require('punycode-regex')()
const urlRegex = require('url-regex-safe')

const REGEX_HTTP_PROTOCOL = /^https?:\/\//i

module.exports = url => {
  try {
    const { href, hostname, hash } = new URL(url)
    if (!REGEX_HTTP_PROTOCOL.test(href)) return false
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

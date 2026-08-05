'use strict'

const urlRegex = require('url-regex-safe')

const REGEX_URL_EXACT = urlRegex({
  apostrophes: true,
  exact: true,
  parens: true
})
const REGEX_URL_LOOSE = urlRegex({
  apostrophes: true,
  exact: false,
  parens: true
})

// IANA's root zone lists ~151 xn-- TLDs; the bound keeps a caller-supplied one
// from growing the cache without limit.
const MAX_CACHED_IDN_TLDS = 256
const idnRegexCache = new Map()

const idnRegex = tld => {
  const cached = idnRegexCache.get(tld)
  if (cached !== undefined) return cached
  const regex = urlRegex({
    apostrophes: true,
    exact: true,
    parens: true,
    tlds: [tld]
  })
  if (idnRegexCache.size >= MAX_CACHED_IDN_TLDS) {
    idnRegexCache.delete(idnRegexCache.keys().next().value)
  }
  idnRegexCache.set(tld, regex)
  return regex
}

module.exports = url => {
  try {
    const parsedUrl = new URL(url)
    const { href, hostname, protocol, username, password } = parsedUrl
    if ((protocol !== 'http:' && protocol !== 'https:') || username || password) { return false }

    // url-regex-safe cannot exact-match IPv6 authorities.
    if (hostname[0] === '[') {
      // Matching the whole href would succeed on a URL-looking substring in the
      // path, leaving the authority unchecked (`http://internal/https://example.com/`).
      REGEX_URL_LOOSE.lastIndex = 0
      return REGEX_URL_LOOSE.test(`${parsedUrl.origin}/`) && href
    }

    // url-regex-safe's TLD list has no xn-- entries, so an IDN TLD has to be
    // supplied; an ASCII one stays subject to the built-in public-suffix list.
    const tldIndex = hostname.lastIndexOf('.') + 1
    const regex = hostname.startsWith('xn--', tldIndex)
      ? idnRegex(hostname.slice(tldIndex))
      : REGEX_URL_EXACT

    return regex.test(href) && href
  } catch {
    return false
  }
}

'use strict'

const tlds = require('tlds')
const { domainToASCII } = require('node:url')

// The list stores IDN TLDs in Unicode (`рф`) but a WHATWG hostname is always
// punycoded, so the comparison has to happen in ASCII.
const PUBLIC_TLDS = new Set(tlds.map(tld => domainToASCII(tld)))

const REGEX_IPV4_TLD = /^\d+$/
const REGEX_LABELS =
  /^[a-z\d](?:[a-z\d_-]*[a-z\d])?(?:\.[a-z\d](?:[a-z\d_-]*[a-z\d])?)*$/

const isPublicHostname = hostname => {
  // The parser has already validated the IPv6 literal inside the brackets.
  if (hostname[0] === '[') return true
  if (hostname === 'localhost') return true

  const tldIndex = hostname.lastIndexOf('.') + 1
  const tld = hostname.slice(tldIndex)

  // A numeric last label means the parser resolved the whole host as IPv4.
  if (REGEX_IPV4_TLD.test(tld)) return true

  return tldIndex > 0 && PUBLIC_TLDS.has(tld) && REGEX_LABELS.test(hostname)
}

module.exports = url => {
  try {
    const { href, hostname, protocol, username, password } = new URL(url)
    if ((protocol !== 'http:' && protocol !== 'https:') || username || password) { return false }
    return isPublicHostname(hostname) && href
  } catch {
    return false
  }
}

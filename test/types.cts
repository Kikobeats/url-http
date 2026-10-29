import urlHttp = require('url-http')
import urlHttpLightweight = require('url-http/lightweight')

const href: string | false = urlHttp('https://example.com')
const lightweightHref: string | false = urlHttpLightweight('https://example.com')

console.log(href, lightweightHref)

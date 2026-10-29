import urlHttp from 'url-http'
import urlHttpLightweight from 'url-http/lightweight'

const href: string | false = urlHttp('https://example.com')
const lightweightHref: string | false = urlHttpLightweight('https://example.com')

// @ts-expect-error module.exports is the function itself, it has no `default` property
console.log(urlHttp.default, href, lightweightHref)

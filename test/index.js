'use strict'

const test = require('ava')

;[
  { fn: require('url-http') },
  { fn: require('url-http/lightweight'), isLightweight: true }
].forEach(({ fn: httpUrl, isLightweight }) => {
  test(isLightweight ? 'lightweight » true' : 'true', t => {
    t.true(!!httpUrl('http://kikobeats.com'))
    t.true(!!httpUrl("https://en.wikipedia.org/wiki/Amdahl's_law"))
    t.true(!!httpUrl('https://kikobeats.com'))
    t.true(!!httpUrl('https://www.kikobeats.com'))
    t.true(!!httpUrl('https://en.wikipedia.org/wiki/Saw_(disambiguation)'))
    t.true(!!httpUrl('http://www.kikobeats.com'))
    t.true(
      !!httpUrl(
        'http://www.ccrscenter.org/sites/default/files/CCRS%20District%20Practices%20Brief.pdf'
      )
    )
  })

  test(isLightweight ? 'lightweight » false' : 'false', t => {
    if (!isLightweight) t.false(!!httpUrl('http://Http://kikobeats.com'))
    t.false(!!httpUrl('https://. • 3.7M views'))
    t.false(!!httpUrl())
    t.false(!!httpUrl('callto://'))
    t.false(!!httpUrl('mailto://'))
    t.false(!!httpUrl('httpsucks://lol.wtf'))
    if (!isLightweight) {
      t.false(!!httpUrl('https://admin:admin@test-http-login.vercel.app'))
    }
    if (!isLightweight) t.false(!!httpUrl('http:!!!\0'))
    if (!isLightweight) t.false(!!httpUrl('http://-kikobeats.com'))
  })
})

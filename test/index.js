'use strict'

const test = require('ava')

;[
  { fn: require('..') },
  { fn: require('../lightweight'), isLightweight: true }
].forEach(({ fn: httpUrl, isLightweight }) => {
  test(isLightweight ? 'lightweight » true' : 'true', t => {
    ;[
      'http://kikobeats.com',
      "https://en.wikipedia.org/wiki/Amdahl's_law",
      'https://kikobeats.com',
      'https://www.kikobeats.com',
      'https://en.wikipedia.org/wiki/Saw_(disambiguation)',
      'http://www.kikobeats.com'
    ].forEach(input => {
      const url = httpUrl(input)
      t.is(typeof url, 'string')
      t.true(!!url)
    })
  })

  test(isLightweight ? 'lightweight » false' : 'false', t => {
    const urls = [
      'https://. • 3.7M views',
      undefined,
      null,
      '',
      NaN,
      {},
      function () {},
      'callto://',
      'mailto://',
      'httpsucks://lol.wtf'
    ]

    ;(isLightweight
      ? urls
      : urls.concat([
        'http://Http://kikobeats.com',
        'https://admin:admin@test-http-login.vercel.app',
        'http:!!!\0',
        'http://-kikobeats.com'
      ])
    ).forEach(input => {
      const url = httpUrl(input)
      t.is(typeof url, 'boolean', `'${input}' is not false`)
      t.is(url, false)
    })
  })
})

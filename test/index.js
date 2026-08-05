'use strict'

const test = require('ava').default

;[
  { fn: require('..') },
  { fn: require('../lightweight'), isLightweight: true }
].forEach(({ fn: httpUrl, isLightweight }) => {
  test(isLightweight ? 'lightweight » true' : 'true', t => {
    ;[
      'https://example.com/#:~:text=Example%20Domain,-This%20domain%20is',
      'https://lotus-center.vercel.app/#how-often-should-i-service-my-lotus',
      'https://example.com/audio.mp3#t=45',
      'http://169.254.169.254:1337/',
      'http://[::ffff:a9fe:a9fe]/metadata/v1/',
      'http://[0:0:0:0:0:ffff:a9fe:a9fe]/metadata/v1/',
      'http://[0:0:0:0:0:ffff:169.254.169.254]/metadata/v1/',
      'http://kikobeats.com',
      "https://en.wikipedia.org/wiki/Amdahl's_law",
      'https://kikobeats.com',
      'https://www.kikobeats.com',
      'https://en.wikipedia.org/wiki/Saw_(disambiguation)',
      'http://www.kikobeats.com',
      'https://example.xn--p1ai',
      'https://xn--80a0aaa.com',
      'https://xn--80a0aaa.xn--p1ai'
    ].forEach(input => {
      const url = httpUrl(input)
      t.is(typeof url, 'string', `'${input}' is not true`)
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
        'http://Http://xn--80a0aaa.xn--p1ai',
        'http://Http://kikobeats.com',
        'https://admin:admin@test-http-login.vercel.app',
        'https://trusted.example@example.com/#:~:text=x',
        'https://user:pass@example.com/#:~:text=Example',
        'https://trusted.example@xn--80a0aaa.com/',
        'http://user:pass@[::1]/',
        'http:!!!\0',
        'http://-kikobeats.com',
        'http://internal/https://example.com/#:~:text=x',
        'http://metadata/https://example.com/#:~:text=x',
        'http://xn--internal/https://example.com/',
        'https://example.local/',
        'https://xn--e1afmkfd.local/',
        'https://пример.local/',
        'https://xn--80a0aaa.internal/',
        'https://xn--80a0aaa.invalidtld/'
      ])
    ).forEach(input => {
      const url = httpUrl(input)
      t.is(typeof url, 'boolean', `'${input}' is not false`)
      t.is(url, false)
    })
  })
})

test('IDN TLD regexes survive cache eviction', t => {
  const httpUrl = require('..')
  t.is(httpUrl('https://xn--80a0aaa.xn--p1ai'), 'https://xn--80a0aaa.xn--p1ai/')
  for (let i = 0; i < 300; i++) httpUrl(`https://example.xn--junk${i}`)
  t.is(httpUrl('https://xn--80a0aaa.xn--p1ai'), 'https://xn--80a0aaa.xn--p1ai/')
  t.is(httpUrl('https://xn--80a0aaa.invalidtld/'), false)
})

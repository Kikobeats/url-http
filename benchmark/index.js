'use strict'

const { writeFileSync } = require('fs')
const { join } = require('path')
const { setFlagsFromString } = require('v8')
const { runInNewContext } = require('vm')

const urlHttp = require('..')
const urlHttpLightweight = require('../lightweight')

const RUNS = 7
const VALID_ROUNDS = 30000
const INVALID_ROUNDS = 16000
const LIGHTWEIGHT_ROUNDS = 20000
const MODULE_LOADS = 480

const ENTRY = require.resolve('..')

const VALID_URLS = [
  'https://example.com/#:~:text=Example%20Domain,-This%20domain%20is',
  'https://example.com/audio.mp3#t=45',
  'http://169.254.169.254:1337/',
  'http://[::ffff:a9fe:a9fe]/metadata/v1/',
  'http://kikobeats.com',
  'https://www.kikobeats.com',
  'https://en.wikipedia.org/wiki/Saw_(disambiguation)',
  'https://example.xn--p1ai',
  'https://xn--80a0aaa.com',
  'http://localhost:3000/',
  'https://sub.dom_ain.example.com/',
  'https://example.com/?q=1.'
]

const INVALID_URLS = [
  'https://. • 3.7M views',
  '',
  'callto://',
  'mailto://',
  'httpsucks://lol.wtf',
  'http://Http://kikobeats.com',
  'https://admin:admin@test-http-login.vercel.app',
  'https://trusted.example@example.com/#:~:text=x',
  'http://user:pass@[::1]/',
  'http:!!!\0',
  'http://-kikobeats.com',
  'http://internal/https://example.com/#:~:text=x'
]

const LIGHTWEIGHT_URLS = [
  ...VALID_URLS,
  'mailto://',
  'httpsucks://lol.wtf',
  'not a url'
]
const LIGHTWEIGHT_ACCEPTED = VALID_URLS.length

const countAccepted = (normalize, urls, rounds) => {
  let accepted = 0
  for (let round = 0; round < rounds; round++) {
    for (const url of urls) {
      if (typeof normalize(url) === 'string') accepted++
    }
  }
  return accepted
}

const validCase = {
  name: 'normalize public urls',
  extra: `${VALID_ROUNDS} rounds over ${VALID_URLS.length} urls`,
  timed: () => countAccepted(urlHttp, VALID_URLS, VALID_ROUNDS),
  verify: accepted => accepted === VALID_ROUNDS * VALID_URLS.length
}

const invalidCase = {
  name: 'reject non-public urls',
  extra: `${INVALID_ROUNDS} rounds over ${INVALID_URLS.length} urls`,
  timed: () => countAccepted(urlHttp, INVALID_URLS, INVALID_ROUNDS),
  verify: accepted => accepted === 0
}

const lightweightCase = {
  name: 'lightweight normalize',
  extra: `${LIGHTWEIGHT_ROUNDS} rounds over ${LIGHTWEIGHT_URLS.length} urls`,
  timed: () =>
    countAccepted(urlHttpLightweight, LIGHTWEIGHT_URLS, LIGHTWEIGHT_ROUNDS),
  verify: accepted => accepted === LIGHTWEIGHT_ROUNDS * LIGHTWEIGHT_ACCEPTED
}

const loadCase = {
  name: 'module load builds tld set',
  extra: `${MODULE_LOADS} fresh loads of index.js`,
  timed: () => {
    let loaded = 0
    for (let load = 0; load < MODULE_LOADS; load++) {
      delete require.cache[ENTRY]
      if (
        require(ENTRY)('https://example.xn--p1ai') ===
        'https://example.xn--p1ai/'
      ) { loaded++ }
    }
    return loaded
  },
  verify: loaded => loaded === MODULE_LOADS
}

const CASES = [validCase, invalidCase, lightweightCase, loadCase]

const median = values => {
  const sorted = values.slice().sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

setFlagsFromString('--expose-gc')
const collectGarbage = runInNewContext('gc')

const now = () => process.hrtime.bigint()

const elapsed = started => Number(now() - started) / 1e6

const fmt = value => value.toFixed(1)

const report = slot => {
  const med = slot.walls.length ? median(slot.walls) : Number.NaN
  const min = slot.walls.length ? Math.min(...slot.walls) : Number.NaN
  const max = slot.walls.length ? Math.max(...slot.walls) : Number.NaN
  const extra = `${slot.entry.extra}, errors ${slot.errors}, runs ${RUNS}`
  console.log(
    `${slot.entry.name}  median ${fmt(med)}ms  range ${fmt(min)}-${fmt(
      max
    )}  ${extra}`
  )
  return {
    name: slot.entry.name,
    unit: 'ms',
    value: Number(med.toFixed(1)),
    range: `${fmt(min)}-${fmt(max)}`,
    extra
  }
}

const takeSample = (slot, run) => {
  try {
    collectGarbage()
    const started = now()
    const outcome = slot.entry.timed()
    const wall = elapsed(started)
    if (!slot.entry.verify(outcome)) {
      console.error(`${slot.entry.name} run ${run} produced unexpected output`)
      slot.errors++
      return
    }
    slot.walls.push(wall)
  } catch (error) {
    console.error(error)
    slot.errors++
  }
}

const main = () => {
  const slots = CASES.map(entry => ({ entry, walls: [], errors: 0 }))
  for (const slot of slots) {
    try {
      slot.entry.timed()
    } catch (error) {
      console.error(error)
      slot.errors++
    }
  }
  for (let run = 0; run < RUNS; run++) {
    for (const slot of slots) takeSample(slot, run)
  }
  const results = slots.map(report)
  writeFileSync(
    join(__dirname, '..', 'benchmark-output.json'),
    JSON.stringify(results, null, 2) + '\n'
  )
  const errors = slots.reduce((total, slot) => total + slot.errors, 0)
  if (errors > 0 || results.some(result => !Number.isFinite(result.value))) {
    process.exitCode = 1
  }
}

main()

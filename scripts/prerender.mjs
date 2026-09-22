import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { render } from '../dist-ssr/entry-server.js'

const target = new URL('../dist/index.html', import.meta.url)
const html = await readFile(target, 'utf8')
const placeholder = '<div id="root"></div>'
assert(html.includes(placeholder), 'Missing terminal prerender placeholder')
await writeFile(target, html.replace(placeholder, () => `<div id="root">${render()}</div>`))
console.log('Prerendered the terminal opening screen and project link into dist/index.html.')

/*
 * All site content lives in this file.
 *
 * A command's `run()` returns an array of lines. A line is an array of
 * segments; a segment is { t, tone, href }.
 *
 *   tone: 'amber'  (default body text)
 *         'bright' (highlights, headings)
 *         'dim'    (system / secondary text)
 *         'ok'     (green — OK states)
 *         'link'   (green, needs `href`)
 *
 * Helpers below keep the content blocks readable.
 */

export const WIRE_URL = 'https://djaniefendi.news'
export const ARCHIVE_URL = 'https://djaniefendi.org'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/djaniefendi'
export const GITHUB_URL = 'https://github.com/djaniefendi'
// TODO: add the Academia.edu profile URL once confirmed.
// TODO: add the X (Twitter) profile URL once confirmed.

/** A plain amber line. */
const line = (t) => [{ t, tone: 'amber' }]
/** A bright heading line. */
const head = (t) => [{ t, tone: 'bright' }]
/** A dim / system line. */
const dim = (t) => [{ t, tone: 'dim' }]
/** An empty spacer line. */
const blank = () => [{ t: '', tone: 'amber' }]
/** A label followed by a link. */
const link = (label, href, prefix = '') => [
  ...(prefix ? [{ t: prefix, tone: 'dim' }] : []),
  { t: label, tone: 'link', href },
]
/** A bulleted item. */
const item = (t) => [
  { t: '  · ', tone: 'dim' },
  { t, tone: 'amber' },
]

export const commands = {
  help: {
    description: 'list available commands',
    run: () => [
      dim('available commands:'),
      blank(),
      ...Object.entries(commands)
        .filter(([, cmd]) => !cmd.hidden)
        .map(([name, cmd]) => [
          { t: '  ' + name.padEnd(12), tone: 'bright' },
          { t: cmd.description, tone: 'dim' },
        ]),
      blank(),
      dim('tab completes · up/down cycles history'),
    ],
  },

  whoami: {
    description: 'who is this',
    run: () => [
      head('Djani Efendi'),
      line('Private Equity Associate — Centricus, London'),
      line('Focus: technology and AI infrastructure'),
      line('Currently: MSc Computer and Information Technology (in progress)'),
      line('           — University of Pennsylvania'),
    ],
  },

  career: {
    description: 'where the work happens',
    run: () => [
      head('Centricus — Private Equity Associate (London)'),
      line('Coverage: technology, AI infrastructure'),
    ],
  },

  education: {
    description: 'degrees, in reverse order',
    run: () => [
      line('MSc Computer and Information Technology — University of Pennsylvania'),
      dim('  (in progress)'),
      line('MSc Finance — Cass Business School'),
      line('BSc Mathematical Economics and Finance — University of East Anglia'),
    ],
  },

  research: {
    description: 'papers and essays',
    run: () => [
      dim('selected work (Academia.edu):'),
      blank(),
      item('sports economics'),
      item('Brexit and supply-chain strategy'),
      item('bitcoin'),
      item('art market auction methods'),
    ],
  },

  stack: {
    description: 'how this site is put together',
    run: () => [
      line('react + vite SPA'),
      line('cloudflare pages, auto-deploy from github'),
      line('pre-rendered meta + Person JSON-LD'),
    ],
  },

  wire: {
    description: 'essays, notes and links',
    run: () => [
      head('The Wire — essays, notes and links'),
      blank(),
      link(WIRE_URL, WIRE_URL, '  '),
    ],
  },

  contact: {
    description: 'where to find me',
    run: () => [
      link('linkedin.com/in/djaniefendi', LINKEDIN_URL, '  linkedin   '),
      link('github.com/djaniefendi', GITHUB_URL, '  github     '),
      link(WIRE_URL, WIRE_URL, '  wire       '),
    ],
  },

  clear: {
    description: 'clear the screen',
    clears: true,
    run: () => [],
  },
}

/** Command names offered to tab-completion and the chip row. */
export const commandNames = Object.keys(commands).filter((n) => !commands[n].hidden)

export const notFound = (name) => [
  [
    { t: 'command not found: ', tone: 'dim' },
    { t: name, tone: 'amber' },
  ],
  dim("type 'help' for the list"),
]

/** The boot sequence. `instant` lines skip the typewriter. */
export const bootSequence = [
  { segs: [{ t: 'DJANI-OS v1.0 — phosphor mode: AMBER', tone: 'dim' }] },
  {
    segs: [
      { t: 'mounting /career ....... ', tone: 'dim' },
      { t: 'OK', tone: 'ok' },
    ],
  },
  {
    segs: [
      { t: 'mounting /research ..... ', tone: 'dim' },
      { t: 'OK', tone: 'ok' },
    ],
  },
  {
    segs: [
      { t: 'mounting /wire ......... ', tone: 'dim' },
      { t: 'OK', tone: 'ok' },
    ],
  },
  { segs: [{ t: '', tone: 'amber' }], instant: true },
  { segs: [{ t: '┌──────────────────────────────┐', tone: 'amber' }], instant: true },
  {
    segs: [
      { t: '│  ', tone: 'amber' },
      { t: 'DJANI TERMINAL', tone: 'bright' },
      { t: '              │', tone: 'amber' },
    ],
    instant: true,
  },
  {
    segs: [
      { t: '│  ', tone: 'amber' },
      { t: 'personal index — v1.0', tone: 'dim' },
      { t: '       │', tone: 'amber' },
    ],
    instant: true,
  },
  { segs: [{ t: '└──────────────────────────────┘', tone: 'amber' }], instant: true },
  { segs: [{ t: '', tone: 'amber' }], instant: true },
  {
    segs: [
      { t: 'type ', tone: 'dim' },
      { t: 'help', tone: 'bright' },
      { t: ' to begin', tone: 'dim' },
    ],
  },
]

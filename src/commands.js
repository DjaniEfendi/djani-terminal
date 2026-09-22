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
export const DOCUMENTARY_URL = 'https://meskhetianturks.com/'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/djaniefendi'
export const GITHUB_URL = 'https://github.com/djaniefendi'
export const YOUTUBE_URL = 'https://www.youtube.com/channel/UCTaaBk2gjTEKiCJu3Wr4WEg'
export const ACADEMIA_URL = 'https://independent.academia.edu/DjaniEfendi'
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

  projects: {
    description: 'documentary and creative work',
    run: () => [
      head('The Meskhetian Turks'),
      line('An interactive documentary I created about the history and heritage'),
      line('of the Ahıska people.'),
      blank(),
      link('Explore the documentary', DOCUMENTARY_URL),
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
      link('youtube.com/channel/UCTaaBk2gjTEKiCJu3Wr4WEg', YOUTUBE_URL, '  youtube    '),
      link('independent.academia.edu/DjaniEfendi', ACADEMIA_URL, '  academia   '),
      link(WIRE_URL, WIRE_URL, '  wire       '),
    ],
  },

  clear: {
    description: 'clear the screen',
    clears: true,
    run: () => [],
  },

  /*
   * Hidden — `hidden: true` keeps it out of `help`, the chip row and
   * tab-completion, but it still runs if you know to type it.
   *
   * Unlike the others this one animates, so it supplies `play(ctx)` instead of
   * `run()`. ctx gives it print/update/sleep and a `reduced` flag.
   */
  who: {
    hidden: true,
    description: 'if not you, then who?',
    play: async (ctx) => {
      const START = 8214067090
      const count = (n) => 'candidates remaining: ' + n.toLocaleString('en-US')

      const finale = () => {
        ctx.print([{ t: '', tone: 'amber' }])
        ctx.print([{ t: 'if not you,', tone: 'amber' }])
        return ctx.sleep(420).then(() => {
          ctx.print([{ t: 'then who?', tone: 'amber' }])
          return ctx.sleep(760).then(() => {
            ctx.print([{ t: '', tone: 'amber' }])
            ctx.print([{ t: 'you.', tone: 'you' }])
          })
        })
      }

      if (ctx.reduced) {
        ctx.print([{ t: 'SCANNING POPULATION — 8.2B SIGNATURES', tone: 'dim' }])
        ctx.print([{ t: count(0), tone: 'dim' }])
        ctx.print([{ t: 'NONE QUALIFIED.', tone: 'bright' }])
        ctx.print([{ t: '', tone: 'amber' }])
        ctx.print([{ t: 'if not you,', tone: 'amber' }])
        ctx.print([{ t: 'then who?', tone: 'amber' }])
        ctx.print([{ t: '', tone: 'amber' }])
        ctx.print([{ t: 'you.', tone: 'you' }])
        return
      }

      ctx.print([{ t: 'SCANNING POPULATION — 8.2B SIGNATURES', tone: 'dim' }])
      await ctx.sleep(420)

      // Count down to zero over roughly two seconds. The exponent eases the
      // fall so the digits churn visibly instead of dropping linearly.
      const id = ctx.print([{ t: count(START), tone: 'dim' }])
      const FRAMES = 46
      const DURATION = 2000
      for (let i = 1; i <= FRAMES; i++) {
        await ctx.sleep(DURATION / FRAMES)
        const progress = i / FRAMES
        const left = i === FRAMES ? 0 : Math.round(START * (1 - Math.pow(progress, 1.7)))
        ctx.update(id, [{ t: count(left), tone: 'dim' }])
      }

      await ctx.sleep(300)
      ctx.print([{ t: 'NONE QUALIFIED.', tone: 'bright' }])
      await ctx.sleep(1000)
      await finale()
    },
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
  { segs: link('The Meskhetian Turks', DOCUMENTARY_URL, 'project  '), instant: true },
  { segs: [{ t: '', tone: 'amber' }], instant: true },
  {
    segs: [
      { t: 'type ', tone: 'dim' },
      { t: 'help', tone: 'bright' },
      { t: ' to begin', tone: 'dim' },
    ],
  },
]

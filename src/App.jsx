import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  bootSequence,
  commandNames,
  commands,
  notFound,
} from './commands.js'

const PROMPT = 'djani@terminal:~$'
const TYPE_MS = 14 // per character
const LINE_PAUSE_MS = 90 // between boot lines

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const segLength = (segs) => segs.reduce((n, s) => n + s.t.length, 0)

/** Return `segs` truncated to the first `n` characters, across segment boundaries. */
function reveal(segs, n) {
  const out = []
  let left = n
  for (const s of segs) {
    if (left <= 0) break
    out.push({ ...s, t: s.t.slice(0, left) })
    left -= s.t.length
  }
  return out.length ? out : [{ t: '', tone: segs[0]?.tone ?? 'amber' }]
}

// Render instant lines (including the project link) into the initial HTML.
// Reserve the other rows so the typewriter fills them without shifting the link.
const initialLines = () => bootSequence.map((l, id) => ({
  id,
  segs: l.instant ? l.segs : reveal(l.segs, 0),
}))

/** Longest common prefix of a list of strings. */
function commonPrefix(list) {
  if (!list.length) return ''
  let prefix = list[0]
  for (const s of list.slice(1)) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1)
  }
  return prefix
}

function Line({ segs }) {
  return (
    <div className="line">
      {segs.map((s, i) =>
        s.tone === 'link' ? (
          <a
            key={i}
            className="seg link"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {s.t}
          </a>
        ) : (
          <span key={i} className={`seg ${s.tone}`}>
            {s.t}
          </span>
        )
      )}
    </div>
  )
}

export default function App() {
  const [lines, setLines] = useState(initialLines)
  const [booted, setBooted] = useState(false)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [histIndex, setHistIndex] = useState(null)
  const [busy, setBusy] = useState(false)

  const inputRef = useRef(null)
  const screenRef = useRef(null)
  const nextId = useRef(bootSequence.length)

  const push = useCallback((newLines) => {
    setLines((prev) => [
      ...prev,
      ...newLines.map((segs) => ({ id: nextId.current++, segs })),
    ])
  }, [])

  // Print one line and hand back its id, so an animated command can keep
  // rewriting it in place (a counter, a progress line) rather than appending.
  const printLine = useCallback((segs) => {
    const id = nextId.current++
    setLines((prev) => [...prev, { id, segs }])
    return id
  }, [])

  const updateLine = useCallback((id, segs) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, segs } : l)))
  }, [])

  // Reset the reserved boot rows so development StrictMode cannot leave a
  // half-typed first run behind. Instant lines remain visible throughout.
  useEffect(() => {
    setLines(initialLines())
    setBooted(false)

    if (prefersReducedMotion()) {
      setLines(bootSequence.map((l, id) => ({ id, segs: l.segs })))
      setBooted(true)
      return
    }

    let cancelled = false
    const run = async () => {
      for (const [id, bootLine] of bootSequence.entries()) {
        if (cancelled) return

        if (bootLine.instant) {
          await sleep(40)
          continue
        }

        const total = segLength(bootLine.segs)
        for (let n = 1; n <= total; n++) {
          if (cancelled) return
          setLines((prev) =>
            prev.map((l) =>
              l.id === id ? { ...l, segs: reveal(bootLine.segs, n) } : l
            )
          )
          await sleep(TYPE_MS)
        }
        await sleep(LINE_PAUSE_MS)
      }
      if (!cancelled) {
        setBooted(true)
        inputRef.current?.focus()
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  // Keep the newest output in view.
  useLayoutEffect(() => {
    const el = screenRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, booted])

  const runCommand = useCallback(
    (raw) => {
      if (!booted || busy) return

      const entry = raw.trim()
      push([
        [
          { t: PROMPT + ' ', tone: 'ok' },
          { t: entry, tone: 'amber' },
        ],
      ])

      if (entry) setHistory((prev) => [...prev, entry])
      setHistIndex(null)
      setInput('')

      if (!entry) return

      const name = entry.split(/\s+/)[0].toLowerCase()
      const cmd = commands[name]

      if (!cmd) {
        push(notFound(name))
        return
      }
      if (cmd.clears) {
        setLines([])
        return
      }

      // Animated commands drive the screen themselves over time; input is
      // locked until they finish so two runs can't interleave.
      if (cmd.play) {
        setBusy(true)
        Promise.resolve(
          cmd.play({
            print: printLine,
            update: updateLine,
            sleep,
            reduced: prefersReducedMotion(),
          })
        ).finally(() => {
          push([[{ t: '', tone: 'amber' }]])
          setBusy(false)
          inputRef.current?.focus()
        })
        return
      }

      push([...cmd.run(), [{ t: '', tone: 'amber' }]])
    },
    [booted, busy, push, printLine, updateLine]
  )

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      runCommand(input)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!history.length) return
      const next = histIndex === null ? history.length - 1 : Math.max(0, histIndex - 1)
      setHistIndex(next)
      setInput(history[next])
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIndex === null) return
      const next = histIndex + 1
      if (next >= history.length) {
        setHistIndex(null)
        setInput('')
      } else {
        setHistIndex(next)
        setInput(history[next])
      }
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const partial = input.trim().toLowerCase()
      const matches = commandNames.filter((n) => n.startsWith(partial))
      if (!partial || !matches.length) return
      if (matches.length === 1) {
        setInput(matches[0])
        return
      }
      setInput(commonPrefix(matches))
      push([
        [
          { t: PROMPT + ' ', tone: 'ok' },
          { t: input, tone: 'amber' },
        ],
        [{ t: '  ' + matches.join('   '), tone: 'dim' }],
      ])
    }
  }

  // Clicking the page focuses the input — unless the user is following a link
  // or selecting text.
  const focusInput = (e) => {
    if (e.target.closest('a, button')) return
    if (window.getSelection()?.toString()) return
    inputRef.current?.focus()
  }

  return (
    <div className="page" onMouseUp={focusInput}>
      <div className="crt">
        <div className="terminal">
          <div className="titlebar">
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="title">djani@efendi — ~/terminal — 80×24</span>
          </div>

          <div className="screen" ref={screenRef}>
            {lines.map((l) => (
              <Line key={l.id} segs={l.segs} />
            ))}

            {booted && (
              <div className="line inputline">
                <span className="seg ok">{PROMPT}</span>
                <span className="inputwrap">
                  <input
                    ref={inputRef}
                    className="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={busy}
                    spellCheck="false"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    aria-label="terminal input"
                  />
                  <span className="ghost" aria-hidden="true">
                    {input}
                    <span className="cursor" />
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="chips">
          {commandNames.map((name) => (
            <button
              key={name}
              className="chip"
              disabled={!booted || busy}
              onClick={() => runCommand(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

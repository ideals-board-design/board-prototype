/* VttConverterPage — "Convert a Google Meet transcript to VTT" (hub utility).

   Integrates the standalone meet-to-vtt tool (logic in meetToVtt.ts, ported
   from it, incl. the Notes by Gemini layout) into the Board UI. Layout per Figma Meetings 32478-293758 /
   Section 5 (32251-171315): Board logo centred on the page, the title inside
   the card, then three steps in one card:
     1. Upload   — how-to steps, drop zone + "Choose .txt file". Gate 1
                   (type / size) runs before reading, gate 2 (looks like a
                   Meet transcript) after; failures show an error banner.
                   One file at a time; files dropped outside the zone don't
                   open in the tab.
     2. Converting — at least 1.5 s so the step registers.
     3. Result   — ready: duration, a preview and the footer actions
                   ("Convert another file" · Download .vtt, Figma 32487-55603);
                   or the validation errors (no file produced).
   Runs entirely in the browser — the transcript is never uploaded. */

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Banner } from '../components/Banner/Banner'
import { Button } from '../components/Button/Button'
import { Logo } from '../components/Logo/Logo'
import { actions } from '../icons/actions'
import { condition } from '../icons/condition'
import { files } from '../icons/files'
import { checkContent, checkFile, convert, safeName, type ConvertResult } from './meetToVtt'
import styles from './VttConverterPage.module.css'

const icon = (set: { name: string; svg: string }[], name: string) => set.find(i => i.name === name)!.svg
const uploadSvg   = icon(actions, 'upload-alt')
const downloadSvg = icon(actions, 'download-alt')
const loaderSvg   = icon(condition, 'loader-round')
const paperclipSvg = icon(files, 'paperclip')

const Icon = ({ svg }: { svg: string }) => (
  <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: svg }} />
)

const MIN_PROCESSING_MS = 1500

type Step = 'upload' | 'processing' | 'result'

const HOW_TO = [
  <>Open the meeting transcript in Google Docs. It’s in the organiser’s Google Drive, in the <strong>Meet Recordings</strong> folder, and linked from the calendar event. If it’s in a <strong>Notes by Gemini</strong> document, open its <strong>Transcript</strong> tab.</>,
  <>In Google Docs, select <strong>File → Download → Plain text (.txt)</strong>.</>,
  <>Upload the downloaded .txt file below.</>,
]

export default function VttConverterPage() {
  const [step, setStep] = useState<Step>('upload')
  const [uploadError, setUploadError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<ConvertResult | null>(null)
  const [fileBase, setFileBase] = useState<string | null>(null)

  const fileInput   = useRef<HTMLInputElement>(null)
  const cardRef     = useRef<HTMLElement>(null)
  const timers      = useRef<number[]>([])

  // Stop a file dropped outside the drop zone from opening in the browser tab.
  useEffect(() => {
    const pending = timers.current
    const prevent = (e: globalThis.DragEvent) => e.preventDefault()
    window.addEventListener('dragover', prevent)
    window.addEventListener('drop', prevent)
    return () => {
      window.removeEventListener('dragover', prevent)
      window.removeEventListener('drop', prevent)
      pending.forEach(clearTimeout)
    }
  }, [])

  // Move focus to the main action once the result is shown (Download, or
  // "Convert another file" when conversion failed).
  useEffect(() => {
    if (step !== 'result') return
    cardRef.current?.querySelector<HTMLButtonElement>(result?.ok ? '[data-focus="download"] button' : '[data-focus="restart"] button')?.focus()
  }, [step, result])

  const resetInput = () => { if (fileInput.current) fileInput.current.value = '' }

  const process = (text: string) => {
    setStep('processing')
    const t0 = performance.now()
    timers.current.push(window.setTimeout(() => {
      const r = convert(text)
      timers.current.push(window.setTimeout(() => {
        setResult(r)
        setStep('result')
      }, Math.max(0, MIN_PROCESSING_MS - (performance.now() - t0))))
    }, 50))
  }

  const handle = (f?: File) => {
    setUploadError('')
    if (!f) return
    const err = checkFile(f)
    if (err) { setUploadError(err); resetInput(); return }
    const r = new FileReader()
    r.onerror = () => setUploadError(`"${f.name}" couldn’t be read. Try downloading it again.`)
    r.onload = () => {
      const text = String(r.result)
      const cerr = checkContent(text)
      if (cerr) { setUploadError(cerr); resetInput(); return }
      setFileBase(f.name.replace(/\.[^.]+$/, ''))
      process(text)
    }
    r.readAsText(f, 'utf-8')
  }

  const onPick = (e: ChangeEvent<HTMLInputElement>) => handle(e.target.files?.[0])

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = (e: DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const fs = e.dataTransfer.files
    if (fs.length > 1) { setUploadError('Drop one transcript at a time.'); return }
    handle(fs[0])
  }

  const fileName = `${safeName(fileBase || result?.title)}.vtt`

  const download = () => {
    if (!result || !result.ok) return   // guardrail: never download unvalidated output
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([result.vtt], { type: 'text/vtt;charset=utf-8' }))
    a.download = fileName
    document.body.appendChild(a); a.click(); a.remove()
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const restart = () => {
    setResult(null); setFileBase(null); resetInput(); setUploadError(''); setStep('upload')
  }

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <a href="/" className={styles.logo} aria-label="Board home">
          <Logo />
        </a>

        <section ref={cardRef} className={styles.card} aria-labelledby="vtt-title">
          <header className={styles.cardHead}>
            <h1 id="vtt-title" className={styles.title}>Convert a Google Meet transcript to VTT</h1>
            <p className={styles.lede}>Produces a VTT file you can upload to the iDeals Board portal.</p>
          </header>

          {step === 'upload' && (
            <>
              <ol className={styles.steps}>
                {HOW_TO.map((text, i) => <li key={i}>{text}</li>)}
              </ol>

              <div
                className={[styles.drop, dragging ? styles.dropActive : ''].filter(Boolean).join(' ')}
                onDragEnter={onDragOver}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <span className={styles.dropIcon} aria-hidden="true"><Icon svg={paperclipSvg} /></span>
                <p className={styles.dropLabel}>
                  {dragging ? 'Release to upload your transcript' : 'Drop your Google Meet transcript here'}
                </p>
                <Button variant="primary" size="m" iconLeft={<Icon svg={uploadSvg} />} onClick={() => fileInput.current?.click()}>
                  Choose .txt file
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".txt,text/plain"
                  className={styles.fileInput}
                  onChange={onPick}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
              <p className={[styles.muted, styles.hint].join(' ')}>Plain text (.txt) only, up to 5 MB. One file at a time.</p>

              {uploadError && (
                <div role="alert">
                  <Banner state="error" message={uploadError} onDismiss={() => setUploadError('')} />
                </div>
              )}
            </>
          )}

          {step === 'processing' && (
            <div className={styles.processing} role="status" aria-live="polite">
              <span className={styles.spinner} aria-hidden="true"><Icon svg={loaderSvg} /></span>
              <p className={styles.processingTitle}>Converting your transcript…</p>
              <p className={styles.muted}>Checking every cue against the original text.</p>
            </div>
          )}

          {step === 'result' && result && (
            result.ok ? (
              <>
                <div>
                  <h2 className={styles.resultTitle}>Your VTT file is ready</h2>
                  <p className={styles.muted}>Duration {result.stats.duration}</p>
                </div>

                <div className={styles.previewBlock}>
                  <h3 className={styles.previewLabel}>Preview</h3>
                  <pre className={styles.preview} tabIndex={0} aria-label="Preview of the VTT file">
                    {result.vtt.replace(/\r\n/g, '\n')}
                  </pre>
                </div>
              </>
            ) : (
              <div className={styles.notice} role="alert">
                <Banner
                  state="error"
                  message="This transcript couldn’t be converted without changing its content, so no file was produced."
                />
                <ul className={styles.noticeList}>
                  {result.errors.map(e => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )
          )}

          {step === 'result' && (
            <div className={styles.restart}>
              <div data-focus="restart">
                <Button variant="secondary" intent="neutral" size="m" onClick={restart}>
                  Convert another file
                </Button>
              </div>
              {result?.ok && (
                <div data-focus="download">
                  <Button variant="primary" size="m" iconLeft={<Icon svg={downloadSvg} />} onClick={download}>
                    Download .vtt
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>

        <p className={styles.footnote}>
          Runs entirely in your browser. Your transcript is never uploaded. Timestamps are estimated from the time markers in the Meet transcript.
        </p>
      </main>
    </div>
  )
}

/* ModalPage — Figma nodes 34919-5041, 34919-5148, 34919-5150, 34919-5160 */

import { useState } from 'react'
import { Modal } from '../../components/Modal/Modal'
import { Button } from '../../components/Button/Button'
import { TextField } from '../../components/TextField/TextField'
import { TextArea } from '../../components/TextArea/TextArea'
import styles from './ModalPage.module.css'
import { SourceLink } from '../SourceLink'

export default function ModalPage() {
  const [openDefault,     setOpenDefault]     = useState(false)
  const [openDestructive, setOpenDestructive] = useState(false)
  const [openInput,       setOpenInput]       = useState(false)
  const [openTextarea,    setOpenTextarea]    = useState(false)
  const [folderName, setFolderName] = useState('New folder')

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Modal</h1>
      <p className={styles.subtitle}>Figma · 34919-5041, 34919-5148, 34919-5150, 34919-5160</p>
      <SourceLink path="src/components/Modal/Modal.tsx" />

      {/* ── Default ──────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Default</h2>
      <div className={styles.trigger}><Button onClick={() => setOpenDefault(true)}>Open modal</Button></div>

      {/* ── Destructive ──────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Destructive</h2>
      <div className={styles.trigger}><Button onClick={() => setOpenDestructive(true)}>Open destructive</Button></div>

      {/* ── Input field ──────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Input field</h2>
      <div className={styles.trigger}><Button onClick={() => setOpenInput(true)}>Create folder</Button></div>

      {/* ── Text area ────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Text area</h2>
      <div className={styles.trigger}><Button onClick={() => setOpenTextarea(true)}>Notify assignee</Button></div>

      {/* ── Modals ───────────────────────────────────────────── */}

      <Modal
        open={openDefault}
        onClose={() => setOpenDefault(false)}
        title="Modal header"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenDefault(false)}>Cancel</Button>
            <Button variant="primary"   onClick={() => setOpenDefault(false)}>Confirm</Button>
          </>
        }
      >
        <p className={styles.description}>Modal description</p>
      </Modal>

      <Modal
        open={openDestructive}
        onClose={() => setOpenDestructive(false)}
        title="Reset meeting notes"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenDestructive(false)}>Cancel</Button>
            <Button variant="primary" intent="danger" onClick={() => setOpenDestructive(false)}>Leave</Button>
          </>
        }
      >
        <p className={styles.description}>
          Are you sure you want to reset the meeting notes to default?<br />
          You'll lose any changes.
        </p>
      </Modal>

      <Modal
        open={openInput}
        onClose={() => setOpenInput(false)}
        title="Create folder"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenInput(false)}>Cancel</Button>
            <Button variant="primary"   onClick={() => setOpenInput(false)}>Create</Button>
          </>
        }
      >
        <TextField
          value={folderName}
          onChange={e => setFolderName((e.target as HTMLInputElement).value)}
          placeholder="Folder name"
        />
      </Modal>

      <Modal
        open={openTextarea}
        onClose={() => setOpenTextarea(false)}
        title="Notify assignee about changes"
        width={720}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenTextarea(false)}>Cancel</Button>
            <Button variant="primary"   onClick={() => setOpenTextarea(false)}>Notify assignee</Button>
          </>
        }
      >
        <TextArea placeholder="Add personal message" />
      </Modal>
    </div>
  )
}

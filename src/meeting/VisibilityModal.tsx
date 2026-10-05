/* VisibilityModal — "Set agenda item visibility" (Figma 11710-104380).
   Negative visibility model: everyone can view by default; access is *removed* per
   user. A restriction on an item is inherited (implicitly) by all its sub-items, so
   the effective restrictions of an item = its own explicit set ∪ every ancestor's
   explicit set. Because that's derived from the live tree, effective visibility
   recomputes automatically when items are nested / unnested / reordered / added.
   Rules: an implicit (inherited) restriction can't be lifted on the child; an
   explicit one can, unless it's also inherited; Secretaries/Admins are never
   restricted. */

import { useState, useEffect } from 'react'
import { Modal }    from '../components/Modal/Modal'
import { Button }   from '../components/Button/Button'
import { Checkbox } from '../components/Checkbox/Checkbox'
import { Avatar }   from '../components/Avatar/Avatar'
import { actions }  from '../icons/actions'
import styles from './VisibilityModal.module.css'

const eyeSlashSvg = actions.find(i => i.name === 'eye-slash')!.svg

export interface VisibilityUser {
  id:    string
  name:  string
  /** Secretaries and Admins can never have visibility removed. */
  role?: 'admin' | 'secretary'
}

/** Minimal agenda item shape the modal needs. */
export interface VisibilityItem {
  id:            string
  path:          number[]
  title:         string
  restrictions?: string[] // explicit restricted user ids
}

export interface VisibilityModalProps {
  open:          boolean
  items:         VisibilityItem[]
  users:         VisibilityUser[]
  initialItemId?: string
  onApply:       (restrictionsByItem: Record<string, string[]>) => void
  onClose:       () => void
}

/** True when `a` is a proper ancestor path of `b` (prefix, shallower). */
function isAncestorPath(a: number[], b: number[]): boolean {
  return a.length < b.length && a.every((v, i) => v === b[i])
}

export function VisibilityModal({ open, items, users, initialItemId, onApply, onClose }: VisibilityModalProps) {
  /* Working copy of every item's explicit restrictions, committed on Apply. */
  const [work, setWork] = useState<Record<string, string[]>>({})
  const [selectedId, setSelectedId] = useState<string | undefined>(initialItemId)

  useEffect(() => {
    if (!open) return
    const w: Record<string, string[]> = {}
    items.forEach(it => { w[it.id] = [...(it.restrictions ?? [])] })
    setWork(w)
    setSelectedId(initialItemId ?? items[0]?.id)
  }, [open, items, initialItemId])

  const selected = items.find(it => it.id === selectedId)

  /** Restricted user ids inherited from an item's ancestors (implicit). */
  const inheritedFor = (item: VisibilityItem): Set<string> => {
    const set = new Set<string>()
    for (const other of items) {
      if (isAncestorPath(other.path, item.path)) (work[other.id] ?? []).forEach(u => set.add(u))
    }
    return set
  }

  /** Whether an item carries any effective restriction (for the eye-slash marker). */
  const hasRestrictions = (item: VisibilityItem): boolean =>
    (work[item.id]?.length ?? 0) > 0 || inheritedFor(item).size > 0

  const toggleUser = (userId: string) => {
    if (!selected) return
    const user = users.find(u => u.id === userId)
    if (user?.role) return                          // Secretaries/Admins are never restricted
    if (inheritedFor(selected).has(userId)) return  // implicit restriction can't be lifted here
    setWork(prev => {
      const cur = prev[selected.id] ?? []
      const next = cur.includes(userId) ? cur.filter(u => u !== userId) : [...cur, userId]
      return { ...prev, [selected.id]: next }
    })
  }

  const inherited = selected ? inheritedFor(selected) : new Set<string>()
  const explicit  = selected ? new Set(work[selected.id] ?? []) : new Set<string>()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Set agenda item visibility"
      width={720}
      footer={
        <>
          <Button variant="secondary" intent="neutral" size="m" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="m" onClick={() => { onApply(work); onClose() }}>Apply</Button>
        </>
      }
    >
      <div className={styles.body}>
        {/* Left — agenda item tree */}
        <div className={styles.itemsPanel}>
          <div className={styles.colHeader}>Agenda</div>
          <div className={styles.itemsList}>
            {items.map(item => (
              <button
                key={item.id}
                type="button"
                className={[styles.itemRow, item.id === selectedId ? styles.itemRowActive : ''].filter(Boolean).join(' ')}
                style={{ paddingLeft: `calc(var(--space-16) + ${item.path.length - 1} * var(--space-12))` }}
                onClick={() => setSelectedId(item.id)}
              >
                <span className={styles.itemLabel}>
                  {item.path.length === 1 ? `${item.path[0]}.` : item.path.join('.')} {item.title || 'Untitled agenda item'}
                </span>
                {hasRestrictions(item) && (
                  <span className={styles.eyeSlash} aria-hidden="true" dangerouslySetInnerHTML={{ __html: eyeSlashSvg }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right — users with a view checkbox */}
        <div className={styles.usersPanel}>
          <div className={styles.usersHeader}>
            <span>Name</span>
            <span>View</span>
          </div>
          <div className={styles.usersList}>
            {users.map(user => {
              const isImplicit = inherited.has(user.id)
              const isExplicit = explicit.has(user.id)
              const restricted = isImplicit || isExplicit
              const locked     = isImplicit || Boolean(user.role)
              const checked    = user.role ? true : !restricted
              return (
                <div key={user.id} className={styles.userRow}>
                  <div className={styles.userInfo}>
                    <Avatar size="s" variant="letters" initials={user.name.slice(0, 1).toUpperCase()} alt={user.name} />
                    <span className={styles.userName}>{user.name}</span>
                    {user.role && <span className={styles.userRole}>({user.role === 'admin' ? 'Admin' : 'Secretary'})</span>}
                  </div>
                  <Checkbox
                    checked={checked}
                    disabled={locked}
                    onChange={() => toggleUser(user.id)}
                    aria-label={`${user.name} can view`}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default VisibilityModal

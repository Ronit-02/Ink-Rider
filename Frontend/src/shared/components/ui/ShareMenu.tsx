import ModalHeader from '@/shared/components/ui/ModalHeader'
import { useRef, useState, type RefObject } from 'react'
import ModalLayer from './ModalLayer'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import LinkIcon from '@/shared/icons/LinkIcon'
import XIcon from '@/shared/icons/XIcon'
import useToast from '@/shared/hooks/useToast'

type Props = {
  anchorRef: RefObject<HTMLElement>
  url: string
  id: string
  label: string
  contentName: string
  onClose: (options?: { restoreFocus?: boolean }) => void
}

export default function ShareMenu({ anchorRef, url, id, label, contentName, onClose }: Props) {
  const copyRef = useRef<HTMLButtonElement>(null)
  const dismiss = () => onClose({ restoreFocus: true })
  const dialogRef = useDialogFocus(dismiss, copyRef)
  const { notify } = useToast()
  const [copying, setCopying] = useState(false)
  const copyLink = async () => {
    if (copying) return
    setCopying(true)
    try {
      await navigator.clipboard.writeText(url)
      notify(`${contentName} link copied.`)
      onClose({ restoreFocus: true })
    } catch {
      notify(`The ${contentName.toLowerCase()} link could not be copied.`, { tone: 'error' })
    } finally {
      setCopying(false)
    }
  }
  const shareX = () => {
    window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer')
    notify('Share window opened.')
    onClose({ restoreFocus: true })
  }
  return <ModalLayer id={id} onDismiss={dismiss} returnFocusRef={anchorRef} aria-labelledby={`${id}-title`} className="grid place-items-center p-4">
    <section ref={dialogRef} tabIndex={-1} className="w-full max-w-[320px] overflow-y-auto rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-menu)]">
      <ModalHeader title={label} titleId={`${id}-title`} onClose={dismiss} closeLabel="Close share options" className="-mx-4 -mt-4 mb-2" />
      {[{ label: 'Copy Link', icon: <LinkIcon />, action: copyLink }, { label: 'Share on X', icon: <XIcon />, action: shareX }].map((item, index) =>
        <button key={item.label} ref={index === 0 ? copyRef : undefined} type="button" onClick={item.action} disabled={copying} aria-busy={index === 0 && copying} className="flex min-h-11 w-full items-center gap-2.5 rounded-[8px] border-none bg-transparent px-3.5 py-2.5 text-left text-[13px] text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-alt)]">{item.icon}{item.label}</button>)}
    </section>
  </ModalLayer>
}

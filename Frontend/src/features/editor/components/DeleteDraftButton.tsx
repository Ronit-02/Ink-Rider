import { useEffect, useId, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Button from '@/shared/components/ui/Button'
import ModalHeader from '@/shared/components/ui/ModalHeader'
import ModalLayer from '@/shared/components/ui/ModalLayer'
import useDialogFocus from '@/shared/hooks/useDialogFocus'
import useToast from '@/shared/hooks/useToast'
import { deleteDraft } from '../api/drafts'

type Draft = { _id: string; title: string }

export default function DeleteDraftButton({ draft }: { draft: Draft }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  return <>
    <Button ref={triggerRef} variant="action" className="shrink-0 !text-[var(--color-danger)]" aria-label={`Delete draft: ${draft.title || 'Untitled draft'}`} onClick={() => setOpen(true)}>Delete draft</Button>
    {open && <DeleteDraftDialog draft={draft} trigger={triggerRef.current} onClose={() => setOpen(false)} />}
  </>
}

function DeleteDraftDialog({ draft, trigger, onClose }: { draft: Draft; trigger: HTMLButtonElement | null; onClose: () => void }) {
  const id = useId()
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const pendingRef = useRef(false)
  const deletedRef = useRef(false)
  const container = useRef(trigger?.closest('[role="tabpanel"], section'))
  useEffect(() => () => {
    if (!deletedRef.current) return
    // Wait for both the removed row and native dialog focus restoration to settle.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = container.current?.querySelector<HTMLElement>('a[href], button:not(:disabled)')
        || document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"], section[aria-label="Drafts"] h2')
      if (target) { if (!target.matches('a, button')) target.tabIndex = -1; target.focus({ preventScroll: true }) }
    }))
  }, [])
  const remove = useMutation({
    mutationFn: () => deleteDraft(draft._id),
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: ['me', 'drafts'] })
      deletedRef.current = true
      queryClient.setQueryData<Draft[]>(['me', 'drafts'], drafts => drafts?.filter(item => item._id !== draft._id))
      queryClient.removeQueries({ queryKey: ['draft', draft._id], exact: true })
      void queryClient.invalidateQueries({ queryKey: ['me', 'drafts'] })
      notify('Draft deleted.')
      onClose()
    },
  })
  const dismiss = () => { if (!pendingRef.current) onClose() }
  const dialogRef = useDialogFocus(dismiss, cancelRef)
  const confirm = async () => {
    if (pendingRef.current) return
    pendingRef.current = true
    try { await remove.mutateAsync() } catch { /* Keep the draft and confirmation available for retry. */ }
    finally { pendingRef.current = false }
  }
  return <ModalLayer onDismiss={dismiss} aria-labelledby={`${id}-title`} className="flex items-center justify-center p-4">
    <section ref={dialogRef} tabIndex={-1} className="w-full max-w-[420px] overflow-y-auto rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-menu)]">
      <ModalHeader title="Delete draft?" titleId={`${id}-title`} closeLabel="Close draft deletion" onClose={dismiss} />
      <div className="p-4 sm:p-6">
        <p className="break-words text-[13px] leading-5 text-[var(--color-text-secondary)]">Permanently delete “{draft.title || 'Untitled draft'}”? This cannot be undone.</p>
        {remove.isError && <p role="alert" className="mt-3 text-[13px] text-[var(--color-danger)]">The draft could not be deleted. Please try again.</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button ref={cancelRef} variant="secondary" disabled={remove.isPending} onClick={dismiss}>Cancel</Button>
          <Button variant="danger" disabled={remove.isPending} aria-busy={remove.isPending} onClick={confirm}>Delete draft</Button>
        </div>
      </div>
    </section>
  </ModalLayer>
}

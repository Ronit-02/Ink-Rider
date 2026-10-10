import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageFrame from '@/shared/components/layout/PageFrame'
import Button from '@/shared/components/ui/Button'
import useToast from '@/shared/hooks/useToast'
import retainRetryView from '@/shared/utils/retainRetryView'
import { fetchMyProfile, updateMyProfile } from '../../api/profile'

type Profile = { displayName: string; bio: string; handle: string | null }

export default function EditProfilePage() {
  const profile = retainRetryView(useQuery<Profile>({ queryKey: ['me', 'profile'], queryFn: fetchMyProfile }))
  return <PageFrame>
    <h1 className="mb-8 text-[24px] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Edit profile</h1>
    {profile.isLoading ? <p role="status" className="text-[13px] text-[var(--color-text-muted)]">Loading profile…</p>
      : profile.isError && !profile.data ? <div><p role="alert" className="text-[13px] text-[var(--color-danger)]">We couldn’t load your profile.</p><Button variant="secondary" className="mt-4" onClick={() => profile.refetch()} aria-busy={profile.isFetching} disabled={profile.isFetching}>Try again</Button></div>
        : profile.data && <ProfileEditForm profile={profile.data} />}
  </PageFrame>
}

function ProfileEditForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.displayName || '')
  const [bio, setBio] = useState(profile.bio || '')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const { notify } = useToast()
  const returnTo = '/profile' + (params.size ? '?' + params : '')
  const updateProfile = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['me', 'profile'] })
      if (profile.handle) await queryClient.invalidateQueries({ queryKey: ['writer', profile.handle] })
      notify('Profile updated.')
      navigate(returnTo)
    },
    onError: () => notify('Your profile could not be updated.', { tone: 'error' }),
  })
  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || updateProfile.isPending) return
    updateProfile.mutate({ username: name.trim(), bio: bio.trim() })
  }
  return <div className="max-w-2xl">
    <form id="profile-edit-form" className="flex flex-col gap-2" onSubmit={submitProfile}>
              <label htmlFor="profile-display-name" className="text-[11px] font-semibold text-[var(--color-text-muted)]">Display name <span aria-hidden="true">(required)</span><input id="profile-display-name" required minLength={1} maxLength={80} value={name} aria-describedby="profile-display-name-help" onChange={event => setName(event.target.value)} className="mt-1 w-full text-[20px] font-bold border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-[var(--color-bg-alt)] text-[var(--color-text)]" /></label>
              <p id="profile-display-name-help" className="text-right text-[11px] text-[var(--color-text-muted)]">{name.length}/80 characters</p>
              <label htmlFor="profile-biography" className="text-[11px] font-semibold text-[var(--color-text-muted)]">Biography <span className="font-normal">(optional)</span><textarea id="profile-biography" maxLength={500} value={bio} aria-describedby="profile-biography-help" onChange={event => setBio(event.target.value)} className="mt-1 h-24 w-full text-[13px] border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-[var(--color-bg-alt)] text-[var(--color-text)] resize-y" /></label>
              <p id="profile-biography-help" className="text-right text-[11px] text-[var(--color-text-muted)]">{bio.length}/500 characters</p>
            </form>
    {updateProfile.isError && <p role="alert" className="mt-5 text-[12px] text-[var(--color-danger)]">Profile update failed. Please try again.</p>}
    <div className="mt-5 flex flex-wrap gap-2">
      <Button type="button" variant="secondary" disabled={updateProfile.isPending} onClick={() => navigate(returnTo)}>Cancel</Button>
      <Button type="submit" form="profile-edit-form" disabled={!name.trim() || updateProfile.isPending} aria-busy={updateProfile.isPending}>Save</Button>
    </div>
  </div>
}

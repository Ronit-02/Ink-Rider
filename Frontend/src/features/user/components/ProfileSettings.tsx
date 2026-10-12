import Select from '@/shared/components/ui/Select'

type Props = { themePreference: 'system' | 'light' | 'dark'; setTheme: (value: string) => void }
const themes = [{ value: 'system', label: 'Use system theme' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]
const languages = [{ value: 'en', label: 'English' }]

export default function ProfileSettings({ themePreference, setTheme }: Props) {
  return <section aria-labelledby="app-preferences-title" className="border-y border-[var(--color-border)] py-7">
    <h2 id="app-preferences-title" className="mb-5 text-[18px] font-semibold">App preferences</h2>
    <div className="mb-5"><Select id="app-theme" label="Theme" value={themePreference} options={themes} onChange={setTheme} /></div>
    <Select id="app-language" label="Language" value="en" options={languages} onChange={() => {}} describedBy="app-language-help" />
    <p id="app-language-help" className="mt-2 text-[12px] text-[var(--color-text-secondary)]">English is the only language available right now.</p>
  </section>
}

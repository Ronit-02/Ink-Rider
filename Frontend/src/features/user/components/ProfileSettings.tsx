type Props = { dark: boolean; toggleTheme: () => void }

export default function ProfileSettings({ dark, toggleTheme }: Props) {
  return <section aria-labelledby="app-preferences-title" className="border-y border-[var(--color-border)] py-7">
    <h2 id="app-preferences-title" className="mb-5 text-[18px] font-semibold">App preferences</h2>
    <label htmlFor="app-theme" className="mb-2 block text-[13px] font-semibold">Theme</label>
    <select id="app-theme" value={dark ? 'dark' : 'light'} onChange={event => { if ((event.target.value === 'dark') !== dark) toggleTheme() }} className="mb-5 min-h-11 w-full max-w-[420px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 text-[14px]">
      <option value="light">Light</option><option value="dark">Dark</option>
    </select>
    <label htmlFor="app-language" className="mb-2 block text-[13px] font-semibold">Language</label>
    <select id="app-language" defaultValue="en" disabled aria-describedby="app-language-help" className="min-h-11 w-full max-w-[420px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-alt)] px-3 text-[14px]"><option value="en">English</option></select>
    <p id="app-language-help" className="mt-2 text-[12px] text-[var(--color-text-secondary)]">English is the only language available right now.</p>
  </section>
}

import { useState, useRef } from 'react'
import { articles, authors } from '@/shared/data'
import Button from '@/shared/components/ui/Button'
import Divider from '@/shared/components/ui/Divider'
import Pill from '@/shared/components/ui/Pill'
import ArticleCard from '@/features/post/components/ArticleCard'
import HorizontalCard from '@/features/post/components/HorizontalCard'

// ─── Mock logged-in user ───────────────────────────────────────────────────────
const ME = { ...authors[0], joinDate: 'January 2023', totalViews: 12400, weeklyViews: 118, subscribers: 84 }
const INTERESTS_LIST = ['Travel', 'Writing', 'Philosophy', 'Science', 'AI', 'Culture']

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'posts',     label: 'My Posts' },
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'history',   label: 'Read History' },
  { id: 'following', label: 'Following' },
  { id: 'analytics', label: 'Analytics' },
]

// ─── Small stat card ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div className="px-5 py-4 bg-[var(--color-bg-alt)] rounded-[14px] border border-[var(--color-border)]">
      <p className="font-bold text-[22px] text-[var(--color-text)] mb-0.5">{value}</p>
      <p className="text-[12px] text-[var(--color-text-secondary)]">{label}</p>
      {sub && <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{sub}</p>}
    </div>
  )
}

// ─── Simple bar chart ──────────────────────────────────────────────────────────
const WEEKLY = [{ l: 'Mon', v: 18 }, { l: 'Tue', v: 24 }, { l: 'Wed', v: 15 }, { l: 'Thu', v: 31 }, { l: 'Fri', v: 22 }, { l: 'Sat', v: 8 }]
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.v))
  return (
    <div className="flex gap-[6px] items-end h-[80px]">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-[var(--color-accent)] rounded-t-[3px] transition-all duration-500"
            style={{ height: max > 0 ? `${(d.v / max) * 70}px` : '2px', minHeight: 2 }} />
          <span className="text-[10px] text-[var(--color-text-muted)]">{d.l}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Profile Page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [tab,          setTab]          = useState('overview')
  const [editMode,     setEditMode]     = useState(false)
  const [name,         setName]         = useState(ME.name)
  const [bio,          setBio]          = useState(ME.bio)
  const [avatarSrc,    setAvatarSrc]    = useState(ME.avatar)
  const [interests,    setInterests]    = useState(INTERESTS_LIST.slice(0, 4))
  const [subscEnabled, setSubscEnabled] = useState(false)
  const fileRef = useRef()

  return (
    <div className="max-w-[960px] mx-auto px-8 pt-10 pb-20">

      {/* ── Profile header ── */}
      <div className="flex gap-6 mb-8 items-start flex-wrap">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img src={avatarSrc} alt={name}
            className="w-20 h-20 rounded-full object-cover"
            style={{ border: '3px solid var(--color-border)' }} />
          {editMode && (
            <>
              <button onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-[26px] h-[26px] rounded-full bg-[var(--color-accent)]
                  text-[var(--color-text-inverted)] border-none cursor-pointer text-[12px]
                  flex items-center justify-center">✎</button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files[0]; if(f) setAvatarSrc(URL.createObjectURL(f)) }} />
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          {editMode ? (
            <div className="flex flex-col gap-[10px]">
              <input value={name} onChange={e => setName(e.target.value)}
                className="text-[22px] font-bold border border-[var(--color-border)] rounded-[10px] px-3 py-[6px]
                  bg-[var(--color-bg-alt)] text-[var(--color-text)] outline-none"
                style={{ fontFamily: 'var(--font-display)' }} />
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                className="text-[13px] border border-[var(--color-border)] rounded-[10px] px-3 py-2
                  bg-[var(--color-bg-alt)] text-[var(--color-text)] resize-none h-20 font-[inherit] outline-none" />
            </div>
          ) : (
            <>
              <h1 className="font-bold text-[22px] mb-1.5 text-[var(--color-text)]"
                style={{ fontFamily: 'var(--font-display)' }}>{name}</h1>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.6] mb-2">{bio}</p>
              <p className="text-[12px] text-[var(--color-text-muted)]">Member since {ME.joinDate}</p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          {editMode ? (
            <>
              <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button variant="primary"   onClick={() => setEditMode(false)}>Save Changes</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setEditMode(true)}>Edit Profile</Button>
          )}
        </div>
      </div>

      {/* ── Subscription unlock banner ── */}
      {ME.weeklyViews >= 100 && !subscEnabled && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-[20px] mb-7 flex-wrap"
          style={{ background: 'linear-gradient(135deg,#1a1a18 0%,#333 100%)' }}>
          <div>
            <p className="font-bold text-[14px] text-white mb-1">🎉 You qualify for subscriptions!</p>
            <p className="text-[12px] text-white/70">{ME.weeklyViews} views this week — enable subscriptions to earn from your writing.</p>
          </div>
          <Button variant="secondary"
            className="!bg-white !text-[#111] !border-none flex-shrink-0"
            onClick={() => setSubscEnabled(true)}>Enable Subscriptions</Button>
        </div>
      )}
      {subscEnabled && (
        <div className="flex items-center gap-3 px-5 py-[14px] bg-[var(--color-bg-alt)] rounded-[20px]
          border border-[var(--color-border)] mb-7">
          <span className="text-[20px]">✅</span>
          <p className="text-[13px] text-[var(--color-text)]">Subscriptions enabled. Readers can now subscribe to your profile.</p>
        </div>
      )}

      <Divider className="mb-7" />

      {/* ── Tabs ── */}
      <div className="flex gap-[6px] mb-8 flex-wrap">
        {TABS.map(t => <Pill key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />)}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-8">
          <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))' }}>
            <StatCard label="Total views"  value={ME.totalViews.toLocaleString()} />
            <StatCard label="Weekly views" value={ME.weeklyViews} sub="↑ 12% this week" />
            <StatCard label="Subscribers"  value={ME.subscribers} />
            <StatCard label="Articles"     value={articles.length} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-3">
              Your Interests
            </p>
            <div className="flex gap-2 flex-wrap">
              {INTERESTS_LIST.map(it => (
                <Pill key={it} label={it} active={interests.includes(it)}
                  onClick={() => setInterests(prev => prev.includes(it) ? prev.filter(i => i !== it) : [...prev, it])} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-4">Recent Posts</p>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))' }}>
              {articles.slice(0, 3).map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </div>
        </div>
      )}

      {tab === 'posts'     && <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))' }}>{articles.map(a => <ArticleCard key={a.id} article={a} />)}</div>}
      {tab === 'bookmarks' && <div>{articles.slice(2, 7).map(a => <HorizontalCard key={a.id} article={a} />)}</div>}
      {tab === 'history'   && <div>{articles.slice(0, 6).map(a => <HorizontalCard key={a.id} article={a} />)}</div>}

      {tab === 'following' && (
        <div>
          {authors.slice(1, 6).map(a => (
            <div key={a.id} className="flex items-center justify-between py-[14px] border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <img src={a.avatar} alt={a.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-[14px] mb-0.5 text-[var(--color-text)]">{a.name}</p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">{a.bio.slice(0, 60)}…</p>
                </div>
              </div>
              <Button variant="secondary" className="text-[12px]">Unfollow</Button>
            </div>
          ))}
        </div>
      )}

      {tab === 'analytics' && (
        <div className="flex flex-col gap-7">
          <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))' }}>
            <StatCard label="Total views"    value={ME.totalViews.toLocaleString()} sub="All time" />
            <StatCard label="This week"      value={ME.weeklyViews} sub="↑ 12% vs last week" />
            <StatCard label="Avg. read time" value="4.2 min" />
            <StatCard label="Subscribers"    value={ME.subscribers} sub={`${ME.weeklyViews}/100 views/week`} />
          </div>
          <div className="px-6 py-5 bg-[var(--color-bg-alt)] rounded-[20px] border border-[var(--color-border)]">
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-3">
              Views this week
            </p>
            <BarChart data={WEEKLY} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] mb-4">
              Top Performing Articles
            </p>
            {articles.slice(0, 4).map((a, i) => (
              <div key={a.id} className="flex items-center gap-4 py-3 border-b border-[var(--color-border)]">
                <span className="text-[12px] text-[var(--color-text-muted)] w-5 text-right flex-shrink-0">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[13px] text-[var(--color-text)] mb-0.5 truncate">{a.title}</p>
                  <p className="text-[12px] text-[var(--color-text-muted)]">{a.readTime}</p>
                </div>
                <span className="font-bold text-[13px] text-[var(--color-text)] flex-shrink-0">
                  {(1200 - i * 180).toLocaleString()} views
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

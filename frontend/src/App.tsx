import { useEffect, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import { api, type CaseBrief, type HypothesisResult } from './lib/api'

type Tab = 'EVIDENCE' | 'TIMELINE' | 'SUSPECTS' | 'ANALYSIS'
type View = 'INVESTIGATION' | 'HYPOTHESIS' | 'CONCLUSION'

function App() {
  const [view, setView] = useState<View>('INVESTIGATION')
  const [activeTab, setActiveTab] = useState<Tab>('EVIDENCE')
  const [caseData, setCaseData] = useState<CaseBrief | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvidence, setSelectedEvidence] = useState<CaseBrief['evidence'][0] | null>(null)
  const [selectedSuspect, setSelectedSuspect] = useState<CaseBrief['suspects'][0] | null>(null)
  const [hypothesisResult, setHypothesisResult] = useState<HypothesisResult | null>(null)
  const [conclusionResult, setConclusionResult] = useState<{ correct: boolean; actualCulpritId: string; score: number } | null>(null)
  const [scan, setScan] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [activity, setActivity] = useState<string[]>(['Case file initialized.'])
  const [accusationOpen, setAccusationOpen] = useState(false)

  useEffect(() => {
    generateCase()
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
        return
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setMenuOpen(false)
        setPanelOpen(false)
        return
      }
      const shortcuts: Partial<Record<string, Tab>> = { e: 'EVIDENCE', t: 'TIMELINE', s: 'SUSPECTS', a: 'ANALYSIS' }
      const tab = shortcuts[event.key.toLowerCase()]
      if (tab) setActiveTab(tab)
      if (event.key.toLowerCase() === 'g') setScan(current => !current)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  async function generateCase() {
    setLoading(true)
    setError(null)
    setConclusionResult(null)
    setHypothesisResult(null)
    setView('INVESTIGATION')
    try {
      const generated = await api.generateCase({
        difficulty: 'HARD',
        crimeType: 'MURDER',
        suspectCount: 5,
        evidenceDensity: 'HIGH',
        redHerringCount: 2,
        timelineComplexity: 'MEDIUM',
        seed: `CASE-${Date.now()}`,
      })
      setCaseData(generated)
      setActivity(['Case file initialized.', `Evidence collected: ${generated.evidence.length} items.`, `Suspects identified: ${generated.suspects.length} persons.`])
      if (generated.evidence.length > 0) {
        setSelectedEvidence(generated.evidence[0]!)
      }
      if (generated.suspects.length > 0) {
        setSelectedSuspect(generated.suspects[0]!)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate case')
    } finally {
      setLoading(false)
    }
  }

  async function createHypothesis() {
    if (!caseData || !selectedSuspect) return
    setLoading(true)
    setActivity(prev => [...prev, `Hypothesis created: ${selectedSuspect.name} analysis initiated.`])
    try {
      const supportingEvidence = caseData.evidence
        .filter(e => e.reliability >= 80 && e.relevance >= 70)
        .slice(0, 3)
        .map(e => e.id)

      const result = await api.evaluateHypothesis(caseData.id, {
        hypothesisId: `H-${Date.now()}`,
        suspectId: selectedSuspect.id,
        description: `${selectedSuspect.name} committed the crime.`,
        claims: [{
          description: 'Suspect had presence and opportunity.',
          supportingEvidenceIds: supportingEvidence,
          contradictingEvidenceIds: [],
        }],
      })
      setHypothesisResult(result)
      setView('HYPOTHESIS')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hypothesis evaluation failed')
    } finally {
      setLoading(false)
    }
  }

  async function submitConclusion() {
    if (!caseData || !selectedSuspect) return
    setAccusationOpen(false)
    setLoading(true)
    try {
      const result = await api.submitConclusion(caseData.id, {
        culpritId: selectedSuspect.id,
        confidence: 'HIGH',
      })
      setConclusionResult(result)
      setView('CONCLUSION')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conclusion submission failed')
    } finally {
      setLoading(false)
    }
  }

  function selectEvidence(item: CaseBrief['evidence'][0]) {
    setSelectedEvidence(item)
    setPanelOpen(true)
    setActivity(prev => [...prev, `Evidence ${item.id} inspected.`])
  }

  function changeZoom(change: number) {
    setZoom(current => Math.min(140, Math.max(70, current + change)))
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void document.documentElement.requestFullscreen()
    }
  }

  const searchResults = caseData
    ? [
        ...caseData.evidence.map(item => ({ id: item.id, label: item.title, kind: 'EVIDENCE', action: () => { selectEvidence(item); setActiveTab('EVIDENCE') } })),
        ...caseData.suspects.map(item => ({ id: item.id, label: item.name, kind: 'SUSPECT', action: () => { setSelectedSuspect(item); setActiveTab('SUSPECTS'); setActivity(prev => [...prev, `Suspect ${item.name} selected.`]) } })),
      ].filter(item => `${item.id} ${item.label}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  if (loading && !caseData) {
    return (
      <main className="workstation">
        <div className="atmosphere" />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ gridColumn: '1 / -1', display: 'grid', placeItems: 'center', minHeight: '100vh' }}
        >
          <div style={{ textAlign: 'center' }}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: '48px', marginBottom: '16px' }}
            >
              ◌
            </motion.div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#8D98A8', letterSpacing: '1px' }}>
              GENERATING CASE...
            </div>
          </div>
        </motion.div>
      </main>
    )
  }

  if (error && !caseData) {
    return (
      <main className="workstation">
        <div className="atmosphere" />
        <div style={{ gridColumn: '1 / -1', display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#E56B76' }}>⚠</div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>GENERATION FAILED</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#8D98A8', marginBottom: '20px' }}>
              {error}
            </div>
            <button onClick={generateCase} style={{ padding: '10px 20px', background: 'rgba(124,156,255,.2)', border: '1px solid #7C9CFF', color: '#B8C7FF', borderRadius: '3px', cursor: 'pointer' }}>
              RETRY
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!caseData || !selectedEvidence || !selectedSuspect) return null

  const confidence = Math.round((selectedEvidence.reliability + selectedEvidence.relevance) / 2)

  if (view === 'CONCLUSION' && conclusionResult) {
    return (
      <main className="workstation">
        <div className="atmosphere" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ gridColumn: '1 / -1', display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '40px' }}
        >
          <div className="glass" style={{ maxWidth: '600px', padding: '40px', textAlign: 'center' }}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              style={{ fontSize: '72px', marginBottom: '20px', color: conclusionResult.correct ? '#63D8C5' : '#E56B76' }}
            >
              {conclusionResult.correct ? '✓' : '✗'}
            </motion.div>
            <h1 style={{ fontSize: '32px', marginBottom: '12px', letterSpacing: '-1px' }}>
              {conclusionResult.correct ? 'CASE CLOSED' : 'INCORRECT CONCLUSION'}
            </h1>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#8D98A8', letterSpacing: '1px', marginBottom: '30px' }}>
              {caseData.seed}
            </div>
            
            <div style={{ display: 'grid', gap: '20px', marginBottom: '40px', textAlign: 'left' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#8D98A8', letterSpacing: '1px', marginBottom: '8px' }}>YOUR CONCLUSION</div>
                <div style={{ fontSize: '18px' }}>{selectedSuspect.name}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#8D98A8', letterSpacing: '1px', marginBottom: '8px' }}>ACTUAL CULPRIT</div>
                <div style={{ fontSize: '18px', color: '#63D8C5' }}>
                  {caseData.suspects.find(s => s.id === conclusionResult.actualCulpritId)?.name || 'UNKNOWN'}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#8D98A8', letterSpacing: '1px', marginBottom: '8px' }}>SCORE</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: conclusionResult.correct ? '#63D8C5' : '#E5B75A' }}>
                  {conclusionResult.score}
                </div>
              </div>
            </div>

            <button onClick={generateCase} style={{ padding: '14px 28px', background: 'rgba(124,156,255,.2)', border: '1px solid #7C9CFF', color: '#B8C7FF', borderRadius: '3px', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '1px' }}>
              GENERATE NEW CASE →
            </button>
          </div>
        </motion.div>
      </main>
    )
  }

  if (view === 'HYPOTHESIS' && hypothesisResult) {
    return (
      <main className="workstation">
        <div className="atmosphere" />
        <header className="topbar glass">
          <div className="wordmark"><span>CASE</span><i>//</i><span>NULL</span></div>
          <div className="case-title">
            <span>HYPOTHESIS ANALYSIS</span>
            <strong>{caseData.seed}</strong>
            <b>{caseData.brief.title}</b>
          </div>
          <div className="top-actions">
            <button className="icon-btn" onClick={() => setView('INVESTIGATION')}>←</button>
            <button className="icon-btn" onClick={generateCase}>↻</button>
          </div>
        </header>

        <div style={{ gridColumn: '2 / -1', gridRow: '2', padding: '40px', overflow: 'auto' }}>
          <div className="glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#8D98A8', letterSpacing: '1px', marginBottom: '8px' }}>HYPOTHESIS // {hypothesisResult.hypothesisId}</div>
            <h2 style={{ fontSize: '28px', marginBottom: '16px', letterSpacing: '-1px' }}>{selectedSuspect.name} committed the crime.</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px', padding: '30px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#8D98A8', letterSpacing: '1px', marginBottom: '12px' }}>CONFIDENCE SCORE</div>
                <div style={{ fontSize: '48px', fontWeight: 700, color: '#7C9CFF' }}>{Math.round(hypothesisResult.score)}%</div>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#8D98A8' }}>{hypothesisResult.confidence.replace(/_/g, ' ')}</div>
              </div>
              <div style={{ display: 'grid', gap: '12px', alignContent: 'start' }}>
                <div><span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#8D98A8' }}>SUPPORTING</span> <strong style={{ color: '#63D8C5', fontSize: '18px', marginLeft: '8px' }}>{hypothesisResult.supportingEvidence.length}</strong></div>
                <div><span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#8D98A8' }}>CONTRADICTING</span> <strong style={{ color: '#E56B76', fontSize: '18px', marginLeft: '8px' }}>{hypothesisResult.contradictingEvidence.length}</strong></div>
                <div><span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#8D98A8' }}>UNRESOLVED</span> <strong style={{ color: '#E5B75A', fontSize: '18px', marginLeft: '8px' }}>{hypothesisResult.unresolvedClaims.length}</strong></div>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '16px', letterSpacing: '0.5px' }}>WHY IS THIS HYPOTHESIS {hypothesisResult.score >= 70 ? 'STRONG' : 'WEAK'}?</h3>
              {hypothesisResult.explanations.map((exp, i) => (
                <div key={i} style={{ marginBottom: '12px', padding: '16px', background: 'rgba(124,156,255,.08)', border: '1px solid rgba(124,156,255,.2)', borderRadius: '3px' }}>
                  <div style={{ fontSize: '11px', lineHeight: '1.6' }}>{exp.reason}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#7C9CFF', marginTop: '8px' }}>
                    Evidence: {exp.evidenceIds.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setView('INVESTIGATION')} style={{ flex: 1, padding: '14px', background: 'rgba(50,60,80,.4)', border: '1px solid var(--border)', color: '#A0B0C8', borderRadius: '3px', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.8px' }}>
                ← BACK TO INVESTIGATION
              </button>
              <button onClick={submitConclusion} disabled={loading} style={{ flex: 1, padding: '14px', background: 'rgba(229,183,90,.2)', border: '1px solid #E5B75A', color: '#F3C973', borderRadius: '3px', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.8px' }}>
                {loading ? 'SUBMITTING...' : 'SUBMIT ACCUSATION →'}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="workstation">
      <div className="atmosphere" />
      <header className="topbar glass">
        <div className="wordmark"><span>CASE</span><i>//</i><span>NULL</span></div>
        <div className="case-title">
          <span>ACTIVE CASE</span>
          <strong>{caseData.seed}</strong>
          <b>{caseData.brief.title}</b>
        </div>
        <div className="top-actions">
          <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>⌕</button>
          <button className="icon-btn" aria-label="Generate new case" onClick={generateCase}>↻</button>
          <div className="agent"><div className="agent-avatar">W</div><span>WAETERR</span></div>
        </div>
      </header>

      <aside className="rail glass">
        <button className="rail-mark active" onClick={() => setActivityOpen(false)}>◈</button>
        <button className="rail-mark" onClick={() => setActiveTab('SUSPECTS')}>▦</button>
        <button className="rail-mark" onClick={() => setActiveTab('TIMELINE')}>⌁</button>
        <button className="rail-mark" onClick={() => setActiveTab('EVIDENCE')}>◫</button>
        <span className="rail-spacer" />
        <button className="rail-mark" onClick={() => setMenuOpen(!menuOpen)}>?</button>
      </aside>

      <section className="sidebar glass">
        <div className="case-file-head"><span className="eyebrow">CASE FILE</span><button className="dots" onClick={() => setMenuOpen(!menuOpen)}>•••</button></div>
        <h1>{caseData.brief.title.split(' ').slice(0, 2).join(' ')}</h1>
        <p className="location">{caseData.locations[0]?.name || 'UNKNOWN LOCATION'}<br /><span>{new Date(caseData.brief.occurredAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} · {new Date(caseData.brief.occurredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span></p>
        <div className="status-line"><i /> ACTIVE INVESTIGATION</div>
        <div className="case-stats">
          <div><span>DIFFICULTY</span><b className="stars">★★★★<em>★</em></b></div>
          <div><span>PROGRESS</span><b>0%</b><div className="progress"><i style={{ width: '0%' }} /></div></div>
          <div><span>EVIDENCE</span><b>{caseData.evidence.length} <small>/ {caseData.evidence.length}</small></b></div>
          <div><span>SUSPECTS</span><b>{caseData.suspects.length.toString().padStart(2, '0')}</b></div>
        </div>
        <div className="sidebar-nav">
          <button className={activityOpen ? '' : 'selected'} onClick={() => setActivityOpen(false)}>◈ CASE OVERVIEW</button>
          <button onClick={() => { setActiveTab('SUSPECTS'); setActivityOpen(false) }}>▣ PEOPLE OF INTEREST <span>{caseData.suspects.length.toString().padStart(2, '0')}</span></button>
          <button onClick={() => { setActiveTab('TIMELINE'); setActivityOpen(false) }}>⌁ LOCATIONS <span>{caseData.locations.length.toString().padStart(2, '0')}</span></button>
          <button className={activityOpen ? 'selected' : ''} onClick={() => setActivityOpen(true)}>▱ INVESTIGATION LOG</button>
        </div>
        <div className="next-action">
          <span>NEXT ACTION</span>
          <strong>{activityOpen ? 'Review investigation log' : selectedSuspect ? `Ready to accuse: ${selectedSuspect.name}` : 'Select a suspect from the list'}</strong>
          <button onClick={activityOpen ? () => setActivityOpen(false) : () => setAccusationOpen(true)} disabled={loading || !selectedSuspect}>
            {activityOpen ? 'BACK TO CASE' : loading ? 'SUBMITTING...' : 'SUBMIT ACCUSATION'} <b>↗</b>
          </button>
        </div>
      </section>

      <section className="content">
        <div className="content-head">
          <div><span className="eyebrow">LIVE EVIDENCE BOARD</span><h2>Establish the connection.</h2></div>
          <div className="board-controls"><button aria-label="Zoom out" onClick={() => changeZoom(-10)}>−</button><button onClick={() => setZoom(100)}>{zoom}%</button><button aria-label="Zoom in" onClick={() => changeZoom(10)}>+</button><button aria-label="Toggle fullscreen" onClick={toggleFullscreen}>⛶</button></div>
        </div>
        {activityOpen ? (
          <div className="evidence-board glass activity-log">
            <span className="eyebrow">INVESTIGATION LOG</span>
            <h3>Activity trace</h3>
            {activity.map((entry, index) => <div className="log-entry" key={`${entry}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span>{entry}</div>)}
          </div>
        ) : <div className={`evidence-board glass ${scan ? 'scanning' : ''}`} style={{ zoom: `${zoom}%` }}>
          <div className="board-grid" />
          <span className="coordinate c1">X: 42.178 / Y: 18.097</span>
          <span className="coordinate c2">{caseData.locations[0]?.name.toUpperCase() || 'CRIME SCENE'}</span>
          <svg className="links" viewBox="0 0 780 425" preserveAspectRatio="none" aria-hidden="true">
            <path d="M195 102 C 300 102, 316 170, 392 180 S 509 161, 592 229" />
            <path d="M195 102 C 292 148, 256 300, 391 316" />
            <path d="M391 316 C 489 290, 486 257, 592 229" />
            <path className="weak" d="M391 180 C 426 254, 460 283, 391 316" />
          </svg>
          {caseData.evidence.slice(0, 5).map((ev, i) => {
            const positions = [
              { top: '66px', left: '8%', className: 'node-cctv' },
              { top: '144px', left: '46%', className: 'node-marcus' },
              { top: '282px', left: '10%', className: 'node-access' },
              { top: '285px', left: '44%', className: 'node-print' },
              { top: '194px', right: '8%', className: 'node-statement' },
            ]
            const pos = positions[i] || positions[0]!
            return (
              <Node
                key={ev.id}
                {...pos}
                code={ev.id}
                label={ev.type.split('_').slice(0, 1).join(' ')}
                icon={ev.type === 'CCTV' ? '◉' : ev.type === 'ACCESS_LOG' ? '▥' : ev.type.includes('STATEMENT') ? '❝' : '⌘'}
                active={selectedEvidence.id === ev.id}
                 onClick={() => selectEvidence(ev)}
              />
            )
          })}
          <button className="scan-control" onClick={() => setScan(!scan)}>
            <i /> {scan ? 'ANALYSIS RUNNING' : 'RUN CROSS-REFERENCE'}
          </button>
          <div className="board-key">
            <span><i className="dot cyan" />VERIFIED</span>
            <span><i className="dot amber" />UNRESOLVED</span>
            <span><i className="line" />RELATIONSHIP</span>
          </div>
        </div>}

        <nav className="tabs glass">
          {(['EVIDENCE', 'TIMELINE', 'SUSPECTS', 'ANALYSIS'] as Tab[]).map(tab => (
            <button
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
              key={tab}
            >
              {tab}
              <span>
                {tab === 'EVIDENCE' ? caseData.evidence.length : tab === 'SUSPECTS' ? caseData.suspects.length : ''}
              </span>
            </button>
          ))}
        </nav>

        <section className="data-strip glass">
          {activeTab === 'EVIDENCE' && caseData.evidence.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedEvidence(item)}
              className={`evidence-row ${selectedEvidence.id === item.id ? 'current' : ''}`}
            >
              <span className="type-dot cyan" />
              <b>{item.id}</b>
              <strong>{item.title}</strong>
              <em>{item.verificationStatus}</em>
              <small>{new Date(item.discoveredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</small>
            </button>
          ))}
          {activeTab === 'TIMELINE' && caseData.timeline.map(event => (
            <div className="timeline-row" key={event.id}>
              <b>{new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</b>
              <i />
              <strong>{event.description}</strong>
              <span>{event.locationId}</span>
            </div>
          ))}
          {activeTab === 'SUSPECTS' && <div className="suspect-list">{caseData.suspects.map((suspect, index) => {
            const statement = caseData.statements.find(item => item.speakerId === suspect.id)
            const selected = selectedSuspect.id === suspect.id
            return <button
              key={suspect.id}
              onClick={() => { 
                setSelectedSuspect(suspect)
                setActivity(prev => [...prev, `Suspect selected: ${suspect.name}`])
              }}
              className={`suspect-row ${selected ? 'current' : ''}`}
              style={{ cursor: 'pointer', background: selected ? 'rgba(124,156,255,.08)' : 'transparent' }}
            >
              <span>{(index + 1).toString().padStart(2, '0')}</span>
              <strong>{suspect.name.toUpperCase()}<small>{suspect.occupation} · {suspect.motive.strength} MOTIVE</small>{statement && <q>“{statement.content}”</q>}</strong>
              <em>{selected ? 'SELECTED' : 'UNDER REVIEW'}</em>
            </button>
          })}</div>}
          {activeTab === 'ANALYSIS' && (
            <div className="analysis-copy">
              <strong>{caseData.evidence.length} pieces of evidence recovered.</strong>
              <span>Optional analysis only. It does not submit or reveal the culprit.</span>
              <button onClick={createHypothesis} disabled={loading}>
                {loading ? 'ANALYZING...' : 'ANALYZE SELECTED SUSPECT →'}
              </button>
            </div>
          )}
        </section>
      </section>

      <AnimatePresence>
        {panelOpen && (
          <motion.aside 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="detail-panel glass"
          >
            <button className="close" onClick={() => setPanelOpen(false)}>×</button>
          <span className="eyebrow">EVIDENCE // {selectedEvidence.id}</span>
          <div className="evidence-icon cyan">
            {selectedEvidence.type === 'CCTV' ? '◉' : selectedEvidence.type === 'ACCESS_LOG' ? '▥' : selectedEvidence.type.includes('STATEMENT') ? '❝' : '⌘'}
          </div>
          <h3>{selectedEvidence.type.replace(/_/g, ' ')}</h3>
          <p>{selectedEvidence.title}</p>
          <div className="evidence-description">{selectedEvidence.description}</div>
          <Metric label="RELIABILITY" value={selectedEvidence.reliability} color="cyan" />
          <Metric label="RELEVANCE" value={selectedEvidence.relevance} color="blue" />
          <div className="metadata">
            <div><span>STATUS</span><b className="verified">{selectedEvidence.verificationStatus}</b></div>
            <div><span>DISCOVERED</span><b>{new Date(selectedEvidence.discoveredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</b></div>
            <div><span>CONFIDENCE</span><b>{confidence}%</b></div>
          </div>
          <div className="connections">
            <span>CONNECTED EVIDENCE</span>
            {caseData.evidence.slice(0, 3).map(ev => (
              <button key={ev.id} onClick={() => selectEvidence(ev)}>→ {ev.id} {ev.type.split('_')[0]}</button>
            ))}
          </div>
        </motion.aside>
      )}
      </AnimatePresence>
      {!panelOpen && (
        <motion.button 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="reopen glass" 
          onClick={() => setPanelOpen(true)}
        >
          OPEN EVIDENCE
        </motion.button>
      )}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overlay" 
            onClick={() => setSearchOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="command glass" 
              onClick={event => event.stopPropagation()}
            >
              <input autoFocus placeholder="Search evidence or suspect... (Ctrl+K)" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} />
              <div className="search-results">
                {searchResults.map(result => (
                  <motion.button 
                    key={result.id} 
                    whileHover={{ x: 4 }}
                    onClick={() => { result.action(); setSearchOpen(false); setSearchQuery('') }}
                  >
                    <span>{result.kind}</span>
                    <strong>{result.label}</strong>
                    <i>{result.id}</i>
                  </motion.button>
                ))}
                {searchResults.length === 0 && <p>NO MATCHES</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="case-menu glass"
          >
            <button onClick={() => { generateCase(); setMenuOpen(false) }}>GENERATE NEW CASE</button>
            <button onClick={() => { setSearchOpen(true); setMenuOpen(false) }}>SEARCH CASE FILE</button>
            <button onClick={() => { setActivityOpen(true); setMenuOpen(false) }}>OPEN ACTIVITY LOG</button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {accusationOpen && selectedSuspect && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overlay" 
            onClick={() => setAccusationOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="glass" 
              style={{ maxWidth: '500px', padding: '40px' }}
              onClick={event => event.stopPropagation()}
            >
              <h2 style={{ fontSize: '24px', marginBottom: '12px', letterSpacing: '-0.5px' }}>SUBMIT ACCUSATION</h2>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#8D98A8', marginBottom: '30px', letterSpacing: '1px' }}>
                FINAL DECISION — CANNOT BE UNDONE
              </div>
              <div style={{ padding: '20px', background: 'rgba(124,156,255,.08)', border: '1px solid rgba(124,156,255,.2)', borderRadius: '3px', marginBottom: '30px' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#8D98A8', marginBottom: '8px', letterSpacing: '1px' }}>YOU ARE ACCUSING</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: '#B8C7FF' }}>{selectedSuspect.name}</div>
                <div style={{ fontSize: '11px', color: '#8D98A8', marginTop: '8px' }}>{selectedSuspect.occupation}</div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setAccusationOpen(false)} style={{ flex: 1, padding: '14px', background: 'rgba(50,60,80,.4)', border: '1px solid var(--border)', color: '#A0B0C8', borderRadius: '3px', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.8px' }}>
                  CANCEL
                </button>
                <button onClick={submitConclusion} disabled={loading} style={{ flex: 1, padding: '14px', background: 'rgba(229,107,118,.2)', border: '1px solid #E56B76', color: '#FF9BA5', borderRadius: '3px', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.8px' }}>
                  {loading ? 'SUBMITTING...' : 'CONFIRM ACCUSATION'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

function Node({ className, code, label, icon, portrait, warning, active, onClick, ...style }: { className: string; code: string; label: string; icon: string; portrait?: boolean; warning?: boolean; active?: boolean; onClick: () => void } & CSSProperties) {
  return (
    <button className={`board-node ${className} ${active ? 'selected-node' : ''} ${warning ? 'warning-node' : ''}`} onClick={onClick} style={style}>
      <span className={portrait ? 'portrait' : 'node-icon'}>{icon}</span>
      <span className="node-text"><i>{code}</i><b>{label}</b></span>
    </button>
  )
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="metric">
      <div><span>{label}</span><b>{value}%</b></div>
      <div className="metric-bar"><i className={color} style={{ width: `${value}%` }} /></div>
    </div>
  )
}

export default App

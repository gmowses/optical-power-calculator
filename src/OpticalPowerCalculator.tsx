import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Zap } from 'lucide-react'

const translations = {
  en: {
    title: 'Optical Power Budget Calculator',
    subtitle: 'Calculate fiber link loss budget: TX/RX power, fiber attenuation, splices, connectors, PON splitter loss. ITU-T G.652.',
    link: 'Link Parameters',
    linkDesc: 'Configure TX/RX and fiber type',
    txPower: 'TX Power (dBm)',
    rxSensitivity: 'RX Sensitivity (dBm)',
    fiberType: 'Fiber type',
    smf: 'SMF (G.652) - 0.35 dB/km @ 1310nm',
    mmf: 'MMF (OM3) - 3.5 dB/km @ 850nm',
    fiberLength: 'Fiber length (km)',
    splices: 'Number of splices (0.1 dB each)',
    connectors: 'Number of connectors (0.5 dB each)',
    ponSplitter: 'PON splitter',
    none: 'None',
    results: 'Results',
    resultsDesc: 'Link budget analysis',
    fiberLoss: 'Fiber attenuation',
    spliceLoss: 'Splice loss',
    connLoss: 'Connector loss',
    splitterLoss: 'Splitter loss',
    totalLoss: 'Total loss',
    rxPower: 'Received power',
    margin: 'Power margin',
    maxDist: 'Max distance (no splitter)',
    status: 'Link status',
    ok: 'Link OK',
    marginal: 'Marginal (< 3 dB margin)',
    fail: 'Link too lossy',
    ponSplitters: 'PON Splitter Loss Reference',
    rfcNote: 'ITU-T G.652 (SMF), ITU-T G.651 (MMF), ITU-T G.984 (GPON), ITU-T G.9807 (XGS-PON)',
    builtBy: 'Built by',
    dB: 'dB', dBm: 'dBm', km: 'km',
  },
  pt: {
    title: 'Calculadora de Orcamento de Potencia Optica',
    subtitle: 'Calcule o orcamento de perda de link de fibra: potencia TX/RX, atenuacao, emendas, conectores e splitters PON. ITU-T G.652.',
    link: 'Parametros do Link',
    linkDesc: 'Configure TX/RX e tipo de fibra',
    txPower: 'Potencia TX (dBm)',
    rxSensitivity: 'Sensibilidade RX (dBm)',
    fiberType: 'Tipo de fibra',
    smf: 'SMF (G.652) - 0,35 dB/km @ 1310nm',
    mmf: 'MMF (OM3) - 3,5 dB/km @ 850nm',
    fiberLength: 'Comprimento da fibra (km)',
    splices: 'Numero de emendas (0,1 dB cada)',
    connectors: 'Numero de conectores (0,5 dB cada)',
    ponSplitter: 'Splitter PON',
    none: 'Nenhum',
    results: 'Resultados',
    resultsDesc: 'Analise do orcamento de link',
    fiberLoss: 'Atenuacao da fibra',
    spliceLoss: 'Perda em emendas',
    connLoss: 'Perda em conectores',
    splitterLoss: 'Perda no splitter',
    totalLoss: 'Perda total',
    rxPower: 'Potencia recebida',
    margin: 'Margem de potencia',
    maxDist: 'Distancia maxima (sem splitter)',
    status: 'Status do link',
    ok: 'Link OK',
    marginal: 'Marginal (< 3 dB de margem)',
    fail: 'Link com perda excessiva',
    ponSplitters: 'Referencia de Perda em Splitters PON',
    rfcNote: 'ITU-T G.652 (SMF), ITU-T G.651 (MMF), ITU-T G.984 (GPON), ITU-T G.9807 (XGS-PON)',
    builtBy: 'Criado por',
    dB: 'dB', dBm: 'dBm', km: 'km',
  },
} as const

type Lang = keyof typeof translations

const PON_SPLITTERS = [
  { label: '1:2', loss: 3.5 },
  { label: '1:4', loss: 7.0 },
  { label: '1:8', loss: 10.5 },
  { label: '1:16', loss: 13.5 },
  { label: '1:32', loss: 17.0 },
  { label: '1:64', loss: 20.5 },
]

export default function OpticalPowerCalculator() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [txPower, setTxPower] = useState(3)
  const [rxSensitivity, setRxSensitivity] = useState(-27)
  const [fiberType, setFiberType] = useState<'smf' | 'mmf'>('smf')
  const [fiberLength, setFiberLength] = useState(5)
  const [splices, setSplices] = useState(2)
  const [connectors, setConnectors] = useState(4)
  const [splitterIdx, setSplitterIdx] = useState(-1)

  const t = translations[lang]

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const attenuation = fiberType === 'smf' ? 0.35 : 3.5
  const budget = txPower - rxSensitivity
  const fiberLoss = fiberLength * attenuation
  const spliceLoss = splices * 0.1
  const connLoss = connectors * 0.5
  const splitterLoss = splitterIdx >= 0 ? PON_SPLITTERS[splitterIdx].loss : 0
  const totalLoss = fiberLoss + spliceLoss + connLoss + splitterLoss
  const rxPower = txPower - totalLoss
  const margin = rxPower - rxSensitivity
  const maxDist = (budget - spliceLoss - connLoss) / attenuation

  const status = margin >= 3 ? 'ok' : margin >= 0 ? 'marginal' : 'fail'
  const statusColor = status === 'ok' ? '#22c55e' : status === 'marginal' ? '#f59e0b' : '#ef4444'

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-semibold">Optical Power Calc</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/optical-power-calculator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Parameters */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
              <div>
                <h2 className="font-semibold">{t.link}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.linkDesc}</p>
              </div>

              {[
                { label: t.txPower, value: txPower, set: setTxPower, min: -10, max: 10, step: 0.5, unit: t.dBm },
                { label: t.rxSensitivity, value: rxSensitivity, set: setRxSensitivity, min: -40, max: -10, step: 0.5, unit: t.dBm },
                { label: t.fiberLength, value: fiberLength, set: setFiberLength, min: 0.1, max: 100, step: 0.1, unit: t.km },
                { label: t.splices, value: splices, set: setSplices, min: 0, max: 50, step: 1, unit: '' },
                { label: t.connectors, value: connectors, set: setConnectors, min: 0, max: 20, step: 1, unit: '' },
              ].map(({ label, value, set, min, max, step, unit }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">{label}</label>
                    <span className="text-sm font-bold text-red-500 tabular-nums">{value}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-red-500" />
                </div>
              ))}

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.fiberType}</label>
                {([['smf', t.smf], ['mmf', t.mmf]] as const).map(([v, label]) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="fiber" value={v} checked={fiberType === v} onChange={() => setFiberType(v)} className="accent-red-500" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t.ponSplitter}</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSplitterIdx(-1)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${splitterIdx === -1 ? 'bg-red-500 text-white border-red-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                    {t.none}
                  </button>
                  {PON_SPLITTERS.map((s, i) => (
                    <button key={s.label} onClick={() => setSplitterIdx(i)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${splitterIdx === i ? 'bg-red-500 text-white border-red-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <div>
                  <h2 className="font-semibold">{t.results}</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.resultsDesc}</p>
                </div>

                {/* Status */}
                <div className="rounded-lg border px-4 py-3 flex items-center gap-3" style={{ borderColor: `${statusColor}40`, backgroundColor: `${statusColor}10` }}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColor }} />
                  <span className="text-sm font-semibold" style={{ color: statusColor }}>{t[status]}</span>
                  <span className="ml-auto text-sm font-mono font-bold" style={{ color: statusColor }}>{margin >= 0 ? '+' : ''}{margin.toFixed(1)} {t.dB} margin</span>
                </div>

                {/* Budget bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>TX {txPower} {t.dBm}</span>
                    <span>Budget: {budget.toFixed(1)} {t.dB}</span>
                    <span>RX min {rxSensitivity} {t.dBm}</span>
                  </div>
                  <div className="h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden relative">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((totalLoss / budget) * 100, 100)}%`, backgroundColor: statusColor }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Loss: {totalLoss.toFixed(2)} {t.dB}</span>
                    <span>Margin: {margin.toFixed(2)} {t.dB}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t.fiberLoss, value: `${fiberLoss.toFixed(2)} ${t.dB}` },
                    { label: t.spliceLoss, value: `${spliceLoss.toFixed(1)} ${t.dB}` },
                    { label: t.connLoss, value: `${connLoss.toFixed(1)} ${t.dB}` },
                    { label: t.splitterLoss, value: `${splitterLoss.toFixed(1)} ${t.dB}` },
                    { label: t.totalLoss, value: `${totalLoss.toFixed(2)} ${t.dB}`, accent: true },
                    { label: t.rxPower, value: `${rxPower.toFixed(2)} ${t.dBm}`, accent: true },
                    { label: t.margin, value: `${margin.toFixed(2)} ${t.dB}`, accent: true },
                    { label: t.maxDist, value: `${maxDist.toFixed(1)} ${t.km}` },
                  ].map(({ label, value, accent }) => (
                    <div key={label} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-0.5">{label}</p>
                      <p className={`text-sm font-bold tabular-nums ${accent ? 'text-red-500' : ''}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Splitter reference */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
                <h3 className="text-sm font-semibold">{t.ponSplitters}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {PON_SPLITTERS.map(s => (
                    <div key={s.label} className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-2 py-1.5 text-center">
                      <p className="text-xs font-bold text-red-500">{s.label}</p>
                      <p className="text-[10px] text-zinc-400">{s.loss} {t.dB}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-zinc-400">{t.rfcNote}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}

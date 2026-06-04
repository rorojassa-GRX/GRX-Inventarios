import { useState, useMemo } from 'react'
import Head from 'next/head'
import {
  LayoutDashboard, Box, Users, BarChart2, TrendingUp, AlertTriangle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import {
  SKUS, SELL_IN, CONTENEDOR_FECHA, TOTAL_CONTENEDOR,
  SKU_MAP, CONTENEDOR_MAP,
  fmt, sellInVenta, sellInMuestras,
  siPorItem, muPorItem, stockNeto, ingPorItem, ingRow,
} from '../data/grx'

type Section = 'resumen' | 'inventario' | 'sellin' | 'facturacion' | 'skus'
type ModoFact = 'individual' | 'comparar'

const CANAL_BADGE: Record<string, string> = {
  Brick: 'badge-blue',
  'E-commerce': 'badge-purple',
}

const ESTADO_BADGE = (stock: number) => {
  if (stock <= 0)   return { label: 'OOS',  cls: 'badge-red',   dot: '#ef4444' }
  if (stock < 200)  return { label: 'Bajo', cls: 'badge-amber', dot: '#f59e0b' }
  return              { label: 'OK',        cls: 'badge-green', dot: '#22c55e' }
}

const MESES: Record<string, string> = {
  '01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun',
  '07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic',
}

const ORDEN_MESES = ['Oct 2025','Nov 2025','Dic 2025','Ene 2026','Feb 2026','Mar 2026','Abr 2026','May 2026']

function parseFecha(f: string) {
  const [, m, y] = f.split('/')
  return { mesLabel: `${MESES[m]} ${y}` }
}

function getMesLabel(f: string) {
  return parseFecha(f).mesLabel
}

export default function Dashboard() {
  const [section, setSection]           = useState<Section>('resumen')
  const [filtroCanal, setFiltroCanal]   = useState('Todos')
  const [filtroCliente, setFiltroCliente] = useState('Todos')
  const [filtroMes, setFiltroMes]       = useState('Todos')
  const [modoFact, setModoFact]         = useState<ModoFact>('individual')
  const [factCliente, setFactCliente]   = useState('')   // individual
  const [factCompara, setFactCompara]   = useState<string[]>([]) // comparar
  const [skuActivo, setSkuActivo]       = useState(SKUS[0].item)

  const siRows    = sellInVenta()
  const totalSI   = siRows.reduce((a, r) => a + r.uds, 0)
  const totalSt   = SKUS.reduce((a, s) => a + stockNeto(s.item), 0)
  const valorBodega = SKUS.reduce((a, s) => a + Math.max(0, stockNeto(s.item)) * s.costo, 0)
  const totalIng  = siRows.reduce((a, r) => a + ingRow(r), 0)
  const ingBrick  = siRows.filter(r => r.canal === 'Brick').reduce((a, r) => a + ingRow(r), 0)
  const ingEcomm  = siRows.filter(r => r.canal === 'E-commerce').reduce((a, r) => a + ingRow(r), 0)
  const pctVend   = Math.round(totalSI / TOTAL_CONTENEDOR * 100)
  const skusAlerta = SKUS.filter(s => stockNeto(s.item) < 200 && stockNeto(s.item) >= 0)
  const totalMu     = sellInMuestras().reduce((a, r) => a + r.uds, 0)
  const valorMu     = sellInMuestras().reduce((a, r) => a + r.uds * (SKU_MAP[r.item]?.costo ?? 0), 0)

  const brickMap: Record<string, { uds: number; ing: number }> = {}
  const ecMap:    Record<string, { uds: number; ing: number }> = {}
  siRows.forEach(r => {
    const m = r.canal === 'Brick' ? brickMap : ecMap
    if (!m[r.cliente]) m[r.cliente] = { uds: 0, ing: 0 }
    m[r.cliente].uds += r.uds
    m[r.cliente].ing += ingRow(r)
  })
  const brickTotal = Object.values(brickMap).reduce((a, v) => a + v.ing, 0)
  const ecTotal    = Object.values(ecMap).reduce((a, v) => a + v.ing, 0)

  const chartData = SKUS.map(s => ({
    name: s.item, stock: Math.max(0, stockNeto(s.item)),
  }))

  // ── Sell In filters ───────────────────────────────────────────────────────
  const canalesDisponibles = ['Todos', 'Brick', 'E-commerce']

  const clientesPorCanal = useMemo(() => {
    const base = filtroCanal === 'Todos' ? siRows : siRows.filter(r => r.canal === filtroCanal)
    return ['Todos', ...Array.from(new Set(base.map(r => r.cliente)))]
  }, [filtroCanal])

  const mesesDisponibles = useMemo(() => {
    let base = siRows
    if (filtroCanal !== 'Todos') base = base.filter(r => r.canal === filtroCanal)
    if (filtroCliente !== 'Todos') base = base.filter(r => r.cliente === filtroCliente)
    const meses = Array.from(new Set(base.map(r => getMesLabel(r.fecha))))
      .sort((a, b) => ORDEN_MESES.indexOf(a) - ORDEN_MESES.indexOf(b))
    return ['Todos', ...meses]
  }, [filtroCanal, filtroCliente])

  const filteredSI = useMemo(() => {
    let rows = siRows
    if (filtroCanal !== 'Todos') rows = rows.filter(r => r.canal === filtroCanal)
    if (filtroCliente !== 'Todos') rows = rows.filter(r => r.cliente === filtroCliente)
    if (filtroMes !== 'Todos') rows = rows.filter(r => getMesLabel(r.fecha) === filtroMes)
    return rows
  }, [filtroCanal, filtroCliente, filtroMes])

  const filteredIng = filteredSI.reduce((a, r) => a + ingRow(r), 0)
  const filteredUds = filteredSI.reduce((a, r) => a + r.uds, 0)

  // ── Facturación ───────────────────────────────────────────────────────────
  const todosClientesSI = Array.from(new Set(siRows.map(r => r.cliente)))

  const clientesFiltroFact = useMemo(() => {
    if (modoFact === 'individual') return factCliente ? [factCliente] : todosClientesSI
    return factCompara.length > 0 ? factCompara : todosClientesSI
  }, [modoFact, factCliente, factCompara])

  const facturacionPorMes = useMemo(() => {
    const mesMap: Record<string, { label: string; total: number; brick: number; ecomm: number }> = {}
    siRows.filter(r => clientesFiltroFact.includes(r.cliente)).forEach(r => {
      const lbl = getMesLabel(r.fecha)
      if (!mesMap[lbl]) mesMap[lbl] = { label: lbl, total: 0, brick: 0, ecomm: 0 }
      const v = ingRow(r)
      mesMap[lbl].total += v
      if (r.canal === 'Brick') mesMap[lbl].brick += v
      else mesMap[lbl].ecomm += v
    })
    return Object.values(mesMap).sort((a, b) => ORDEN_MESES.indexOf(a.label) - ORDEN_MESES.indexOf(b.label))
  }, [clientesFiltroFact])

  const totalFact   = facturacionPorMes.reduce((a, m) => a + m.total, 0)
  const mesMaximo   = facturacionPorMes.reduce((a, m) => m.total > a.total ? m : a, { label: '—', total: 0, brick: 0, ecomm: 0 })
  const promedioMes = facturacionPorMes.length > 0 ? totalFact / facturacionPorMes.length : 0

  // ── SKU detail ────────────────────────────────────────────────────────────
  const skuInfo      = SKU_MAP[skuActivo]
  const skuSI        = siPorItem(skuActivo)
  const skuMu        = muPorItem(skuActivo)
  const skuSt        = stockNeto(skuActivo)
  const skuIng       = ingPorItem(skuActivo)
  const skuByCliente = SELL_IN.filter(r => r.item === skuActivo && r.uds > 0).reduce((acc, r) => {
    if (!acc[r.cliente]) acc[r.cliente] = { uds: 0, ing: 0, canal: r.canal }
    acc[r.cliente].uds += r.uds
    acc[r.cliente].ing += r.cliente !== 'Muestras' ? ingRow(r) : 0
    return acc
  }, {} as Record<string, { uds: number; ing: number; canal: string }>)

  const NAV = [
    { id: 'resumen',     label: 'Resumen',     icon: LayoutDashboard },
    { id: 'inventario',  label: 'Inventario',  icon: Box },
    { id: 'sellin',      label: 'Sell In',     icon: Users },
    { id: 'facturacion', label: 'Facturación', icon: TrendingUp },
    { id: 'skus',        label: 'Por SKU',     icon: BarChart2 },
  ] as const

  const btnStyle = (active: boolean, color = '#4f8ef7') => ({
    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: `1px solid ${active ? color : 'var(--border)'}`,
    background: active ? `${color}22` : 'var(--bg3)',
    color: active ? color : 'var(--text2)', transition: 'all .15s',
  } as React.CSSProperties)

  // Inventory subtotals helper
  const catTotals = (cat: string) => {
    const skus = SKUS.filter(s => s.categoria === cat)
    return {
      cont: skus.reduce((a, s) => a + (CONTENEDOR_MAP[s.item] ?? 0), 0),
      si:   skus.reduce((a, s) => a + siPorItem(s.item), 0),
      mu:   skus.reduce((a, s) => a + muPorItem(s.item), 0),
      st:   skus.reduce((a, s) => a + Math.max(0, stockNeto(s.item)), 0),
      val:  skus.reduce((a, s) => a + Math.max(0, stockNeto(s.item)) * s.costo, 0),
    }
  }
  const grandTotal = {
    cont: SKUS.reduce((a, s) => a + (CONTENEDOR_MAP[s.item] ?? 0), 0),
    si:   SKUS.reduce((a, s) => a + siPorItem(s.item), 0),
    mu:   SKUS.reduce((a, s) => a + muPorItem(s.item), 0),
    st:   SKUS.reduce((a, s) => a + Math.max(0, stockNeto(s.item)), 0),
    val:  SKUS.reduce((a, s) => a + Math.max(0, stockNeto(s.item)) * s.costo, 0),
  }

  return (
    <>
      <Head>
        <title>GRX Group · Dashboard Logístico</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh' }}>

        <nav className="mobile-nav">
          <div className="mobile-nav-inner">
            {NAV.map(n => {
              const Icon = n.icon
              return (
                <button key={n.id} className={`mobile-nav-btn${section === n.id ? ' active' : ''}`}
                  onClick={() => setSection(n.id as Section)}>
                  <Icon size={20} /><span>{n.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        <aside className="sidebar">
          <div style={{ marginBottom: '1.5rem', paddingLeft: 8 }}>
            <img src="/logo.jpg" alt="GRX Group" style={{ width: 140, height: 'auto', borderRadius: 6, marginBottom: 4 }} />
            <div style={{ fontSize: 11, color: 'var(--text3)', paddingLeft: 4 }}>Dashboard logístico</div>
          </div>
          {NAV.map(n => {
            const Icon = n.icon
            return (
              <button key={n.id} className={`nav-link${section === n.id ? ' active' : ''}`} onClick={() => setSection(n.id as Section)}>
                <Icon size={15} /> {n.label}
              </button>
            )
          })}
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', paddingLeft: 4, marginBottom: 6 }}>Contenedor</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', paddingLeft: 4 }}>
              📦 {CONTENEDOR_FECHA}<br />
              <span style={{ color: 'var(--accent)' }}>{TOTAL_CONTENEDOR.toLocaleString()} piezas</span>
            </div>
          </div>
        </aside>

        <main className="main-content">

          {/* ── RESUMEN ─────────────────────────────────────────────────── */}
          {section === 'resumen' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Resumen operativo</h1>
              {skusAlerta.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: '1.25rem', fontSize: 13, color: '#f59e0b' }}>
                  <AlertTriangle size={15} />
                  Stock bajo en: {skusAlerta.map(s => `${s.item} (${stockNeto(s.item)} uds)`).join(', ')}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: '1.5rem' }}>
                {[
                  { label: 'Contenedor',      value: TOTAL_CONTENEDOR.toLocaleString(), sub: CONTENEDOR_FECHA },
                  { label: 'Total sell in',   value: totalSI.toLocaleString(),           sub: `${pctVend}% del contenedor`, color: '#4f8ef7' },
                  { label: 'Ingreso total',   value: fmt(totalIng),                      sub: 'a precio costo MX',          color: '#22c55e' },
                  { label: 'Sell In Brick',   value: fmt(ingBrick),                      sub: `${Math.round(ingBrick/totalIng*100)}% del ingreso` },
                  { label: 'Sell In E-comm',  value: fmt(ingEcomm),                      sub: `${Math.round(ingEcomm/totalIng*100)}% del ingreso` },
                  { label: 'SKUs con alerta', value: skusAlerta.length.toString(),       sub: `de ${SKUS.length} SKUs`, color: skusAlerta.length > 0 ? '#f59e0b' : '#22c55e' },
                  { label: 'Stock actual',    value: totalSt.toLocaleString(),           sub: 'unidades en bodega' },
                  { label: 'Valor en bodega', value: fmt(valorBodega),                   sub: 'a precio costo MX', color: '#14b8a6' },
                  { label: 'Muestras (uds)',  value: totalMu.toLocaleString(),           sub: 'unidades entregadas', color: '#f59e0b' },
                  { label: 'Muestras (valor)',value: fmt(valorMu),                       sub: 'a precio costo MX', color: '#f59e0b' },
                ].map(k => (
                  <div key={k.label} className="kpi-card">
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color ?? 'var(--text)', fontSize: 20 }}>{k.value}</div>
                    <div className="kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Gráfica con etiquetas visibles */}
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>Stock actual por SKU</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 24, right: 8, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8b96ab' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8b96ab' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'var(--text)', fontWeight: 600 }} formatter={(v: number) => [v.toLocaleString(), 'Stock']} />
                    <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="stock" position="top" style={{ fontSize: 11, fontWeight: 600, fill: '#8b96ab' }} formatter={(v: number) => v.toLocaleString()} />
                      {chartData.map((e, i) => (
                        <Cell key={i} fill={e.stock <= 0 ? '#ef4444' : e.stock < 200 ? '#f59e0b' : '#4f8ef7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Canal tables */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { title: 'Sell In Brick',      map: brickMap, total: brickTotal, color: '#4f8ef7' },
                  { title: 'Sell In E-commerce', map: ecMap,    total: ecTotal,    color: '#a78bfa' },
                ].map(({ title, map, total, color }) => (
                  <div key={title} className="card" style={{ marginBottom: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>{title}</div>
                    <table>
                      <thead><tr><th>Cliente</th><th>Uds</th><th>Ingreso</th></tr></thead>
                      <tbody>
                        {Object.entries(map).sort((a, b) => b[1].ing - a[1].ing).map(([cl, v]) => (
                          <tr key={cl}><td style={{ fontWeight: 500 }}>{cl}</td><td>{v.uds.toLocaleString()}</td><td style={{ color: '#22c55e', fontWeight: 500 }}>{fmt(v.ing)}</td></tr>
                        ))}
                      </tbody>
                      <tfoot><tr><td>Total</td><td>{Object.values(map).reduce((a, v) => a + v.uds, 0).toLocaleString()}</td><td style={{ color }}>{fmt(total)}</td></tr></tfoot>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── INVENTARIO ──────────────────────────────────────────────── */}
          {section === 'inventario' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Inventario actual</h1>
              {(['Magnetic Tiles', 'Travel Size', 'Magnetic Brick Tiles'] as const).map(cat => {
                const skus = SKUS.filter(s => s.categoria === cat)
                const sub  = catTotals(cat)
                return (
                  <div key={cat} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{cat}</div>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table>
                          <thead>
                            <tr><th>Item</th><th>UPC</th><th>Descripción</th><th>Costo</th><th>Contenedor</th><th>Sell in</th><th>Muestras</th><th>Stock</th><th>Valor bodega</th><th>% salida</th><th>Estado</th></tr>
                          </thead>
                          <tbody>
                            {skus.map(s => {
                              const si = siPorItem(s.item), mu = muPorItem(s.item), st = stockNeto(s.item)
                              const pct = Math.round((si + mu) / (CONTENEDOR_MAP[s.item] ?? 1) * 100)
                              const { label, cls } = ESTADO_BADGE(st)
                              return (
                                <tr key={s.item}>
                                  <td style={{ fontWeight: 700 }}>{s.item}</td>
                                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>{s.upc}</td>
                                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{s.description}</td>
                                  <td>{fmt(s.costo)}</td>
                                  <td>{(CONTENEDOR_MAP[s.item] ?? 0).toLocaleString()}</td>
                                  <td style={{ color: '#4f8ef7' }}>{si.toLocaleString()}</td>
                                  <td style={{ color: '#f59e0b' }}>{mu}</td>
                                  <td style={{ fontWeight: 700, fontSize: 16, color: st < 200 ? (st <= 0 ? '#ef4444' : '#f59e0b') : 'var(--text)' }}>{st.toLocaleString()}</td>
                                  <td style={{ fontWeight: 600, color: '#14b8a6' }}>{fmt(Math.max(0, st) * s.costo)}</td>
                                  <td>
                                    <div className="progress-bar" style={{ width: 70 }}><div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 70 ? '#f59e0b' : '#4f8ef7' }} /></div>
                                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{pct}%</span>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: ESTADO_BADGE(st).dot, flexShrink: 0, boxShadow: `0 0 6px ${ESTADO_BADGE(st).dot}` }} />
                                      <span className={`badge ${ESTADO_BADGE(st).cls}`}>{ESTADO_BADGE(st).label}</span>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                          {/* Subtotal por categoría */}
                          <tfoot>
                            <tr style={{ background: 'var(--bg3)' }}>
                              <td colSpan={4} style={{ fontWeight: 600, fontSize: 12, color: 'var(--text2)' }}>Subtotal {cat}</td>
                              <td style={{ fontWeight: 600 }}>{sub.cont.toLocaleString()}</td>
                              <td style={{ fontWeight: 600, color: '#4f8ef7' }}>{sub.si.toLocaleString()}</td>
                              <td style={{ fontWeight: 600, color: '#f59e0b' }}>{sub.mu}</td>
                              <td style={{ fontWeight: 700, color: '#14b8a6' }}>{sub.st.toLocaleString()}</td>
                              <td style={{ fontWeight: 700, color: '#14b8a6' }}>{fmt(sub.val)}</td>
                              <td colSpan={2}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Grand total */}
              <div className="card" style={{ background: 'var(--bg3)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Total general</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
                  {[
                    { label: 'Contenedor', value: grandTotal.cont.toLocaleString(), color: 'var(--text)' },
                    { label: 'Sell in',    value: grandTotal.si.toLocaleString(),   color: '#4f8ef7' },
                    { label: 'Muestras',   value: grandTotal.mu.toString(),         color: '#f59e0b' },
                    { label: 'Stock',      value: grandTotal.st.toLocaleString(),   color: 'var(--text)' },
                    { label: 'Valor bodega', value: fmt(grandTotal.val),            color: '#14b8a6' },
                  ].map(k => (
                    <div key={k.label}>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SELL IN ─────────────────────────────────────────────────── */}
          {section === 'sellin' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Sell In por cliente</h1>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Filtros</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Canal</label>
                    <select value={filtroCanal} onChange={e => { setFiltroCanal(e.target.value); setFiltroCliente('Todos'); setFiltroMes('Todos') }}
                      style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }}>
                      {canalesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Cliente</label>
                    <select value={filtroCliente} onChange={e => { setFiltroCliente(e.target.value); setFiltroMes('Todos') }}
                      style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }}>
                      {clientesPorCanal.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Mes</label>
                    <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
                      style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }}>
                      {mesesDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1rem' }}>
                <div className="kpi-card"><div className="kpi-label">Unidades</div><div className="kpi-value" style={{ fontSize: 20, color: '#4f8ef7' }}>{filteredUds.toLocaleString()}</div></div>
                <div className="kpi-card"><div className="kpi-label">Ingreso</div><div className="kpi-value" style={{ fontSize: 20, color: '#22c55e' }}>{fmt(filteredIng)}</div></div>
                <div className="kpi-card"><div className="kpi-label">Líneas</div><div className="kpi-value" style={{ fontSize: 20 }}>{filteredSI.length}</div></div>
              </div>

              <div className="card">
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead><tr><th>Fecha</th><th>Cliente</th><th>Canal</th><th>Item</th><th>Descripción</th><th>Uds</th><th>Costo unit.</th><th>Ingreso</th></tr></thead>
                    <tbody>
                      {filteredSI.length === 0
                        ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem' }}>Sin resultados</td></tr>
                        : filteredSI.map((r, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{r.fecha}</td>
                            <td style={{ fontWeight: 500 }}>{r.cliente}</td>
                            <td><span className={`badge ${CANAL_BADGE[r.canal]}`}>{r.canal}</span></td>
                            <td style={{ fontWeight: 600 }}>{r.item}</td>
                            <td style={{ fontSize: 12, color: 'var(--text2)' }}>{SKU_MAP[r.item]?.description}</td>
                            <td>{r.uds.toLocaleString()}</td>
                            <td style={{ color: 'var(--text2)' }}>{fmt(SKU_MAP[r.item]?.costo ?? 0)}</td>
                            <td style={{ fontWeight: 600, color: '#22c55e' }}>{fmt(ingRow(r))}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── FACTURACIÓN ─────────────────────────────────────────────── */}
          {section === 'facturacion' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Facturación por mes</h1>

              {/* Modo selector */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <button style={btnStyle(modoFact === 'individual')} onClick={() => { setModoFact('individual'); setFactCompara([]) }}>
                    Ver un cliente
                  </button>
                  <button style={btnStyle(modoFact === 'comparar', '#a78bfa')} onClick={() => { setModoFact('comparar'); setFactCliente('') }}>
                    Sumar clientes
                  </button>
                </div>

                {modoFact === 'individual' ? (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Selecciona un cliente</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button style={btnStyle(factCliente === '')} onClick={() => setFactCliente('')}>Todos</button>
                      {todosClientesSI.map(cl => (
                        <button key={cl} style={btnStyle(factCliente === cl)} onClick={() => setFactCliente(cl)}>{cl}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      Selecciona clientes para sumar {factCompara.length > 0 && <span style={{ color: '#a78bfa' }}>· {factCompara.length} seleccionados</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {todosClientesSI.map(cl => (
                        <button key={cl}
                          style={btnStyle(factCompara.includes(cl), '#a78bfa')}
                          onClick={() => setFactCompara(prev => prev.includes(cl) ? prev.filter(x => x !== cl) : [...prev, cl])}>
                          {cl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* KPIs analíticos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: '1.25rem' }}>
                {[
                  { label: 'Total facturado',  value: fmt(totalFact),              color: '#22c55e' },
                  { label: 'Brick',            value: fmt(facturacionPorMes.reduce((a,m)=>a+m.brick,0)), color: '#4f8ef7' },
                  { label: 'E-commerce',       value: fmt(facturacionPorMes.reduce((a,m)=>a+m.ecomm,0)), color: '#a78bfa' },
                  { label: 'Mes más alto',     value: mesMaximo.label,             color: '#f59e0b', sub: fmt(mesMaximo.total) },
                  { label: 'Meses activos',    value: String(facturacionPorMes.length), color: 'var(--text)' },
                ].map(k => (
                  <div key={k.label} className="kpi-card">
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color, fontSize: 18 }}>{k.value}</div>
                    {k.sub && <div className="kpi-sub">{k.sub}</div>}
                  </div>
                ))}
              </div>

              {/* Gráfica */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Ingreso mensual</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>Total: <strong style={{ color: '#22c55e' }}>{fmt(totalFact)}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#4f8ef7', display: 'inline-block' }}></span>Brick</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#a78bfa', display: 'inline-block' }}></span>E-commerce</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={facturacionPorMes} margin={{ top: 4, right: 8, left: 10, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8b96ab' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8b96ab' }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
                    <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number, name: string) => [fmt(v), name === 'brick' ? 'Brick' : 'E-commerce']} />
                    <Bar dataKey="brick" stackId="a" fill="#4f8ef7" />
                    <Bar dataKey="ecomm" stackId="a" fill="#a78bfa" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tabla con % */}
              <div className="card">
                <table>
                  <thead><tr><th>Mes</th><th>Brick</th><th>E-commerce</th><th>Total</th><th>% del total</th></tr></thead>
                  <tbody>
                    {facturacionPorMes.map(m => (
                      <tr key={m.label}>
                        <td style={{ fontWeight: 500 }}>{m.label}</td>
                        <td style={{ color: '#4f8ef7' }}>{fmt(m.brick)}</td>
                        <td style={{ color: '#a78bfa' }}>{fmt(m.ecomm)}</td>
                        <td style={{ fontWeight: 600, color: '#22c55e' }}>{fmt(m.total)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ width: 60 }}>
                              <div className="progress-fill" style={{ width: `${Math.round(m.total/totalFact*100)}%`, background: m.label === mesMaximo.label ? '#f59e0b' : '#4f8ef7' }} />
                            </div>
                            <span style={{ fontSize: 12, color: m.label === mesMaximo.label ? '#f59e0b' : 'var(--text2)', fontWeight: m.label === mesMaximo.label ? 700 : 400 }}>
                              {Math.round(m.total/totalFact*100)}%{m.label === mesMaximo.label ? ' 🏆' : ''}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td style={{ color: '#4f8ef7' }}>{fmt(facturacionPorMes.reduce((a,m)=>a+m.brick,0))}</td>
                      <td style={{ color: '#a78bfa' }}>{fmt(facturacionPorMes.reduce((a,m)=>a+m.ecomm,0))}</td>
                      <td style={{ fontWeight: 700, color: '#22c55e' }}>{fmt(totalFact)}</td>
                      <td style={{ color: 'var(--text2)', fontSize: 12 }}>100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── POR SKU ─────────────────────────────────────────────────── */}
          {section === 'skus' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Análisis por SKU</h1>
              <div style={{ marginBottom: 12 }}>
                <select value={skuActivo} onChange={e => setSkuActivo(e.target.value)}
                  style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', minWidth: 320 }}>
                  {SKUS.map(s => <option key={s.item} value={s.item}>{s.item} · {s.description}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: '1.25rem' }}>
                {[
                  { label: 'Contenedor',  value: (CONTENEDOR_MAP[skuActivo] ?? 0).toLocaleString(), color: 'var(--text)' },
                  { label: 'Sell in',     value: skuSI.toLocaleString(),   color: '#4f8ef7' },
                  { label: 'Muestras',    value: skuMu.toString(),          color: '#f59e0b' },
                  { label: 'Stock neto',  value: skuSt.toLocaleString(),   color: skuSt < 200 ? (skuSt <= 0 ? '#ef4444' : '#f59e0b') : 'var(--text)' },
                  { label: 'Ingreso',     value: fmt(skuIng),               color: '#22c55e' },
                  { label: 'Costo unit.', value: fmt(skuInfo?.costo ?? 0), color: 'var(--text)' },
                ].map(k => (
                  <div key={k.label} className="kpi-card">
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color, fontSize: 20 }}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>Sell in por cliente — {skuActivo}</div>
                <table>
                  <thead><tr><th>Cliente</th><th>Canal</th><th>Uds</th><th>Ingreso</th></tr></thead>
                  <tbody>
                    {Object.entries(skuByCliente).sort((a, b) => b[1].uds - a[1].uds).map(([cl, v]) => (
                      <tr key={cl}>
                        <td style={{ fontWeight: 500 }}>{cl}</td>
                        <td><span className={`badge ${CANAL_BADGE[v.canal] ?? 'badge-gray'}`}>{v.canal}</span>{cl === 'Muestras' && <span className="badge badge-amber" style={{ marginLeft: 4 }}>Muestra</span>}</td>
                        <td>{v.uds.toLocaleString()}</td>
                        <td style={{ color: cl === 'Muestras' ? '#f59e0b' : '#22c55e', fontWeight: 500 }}>{cl === 'Muestras' ? '—' : fmt(v.ing)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}

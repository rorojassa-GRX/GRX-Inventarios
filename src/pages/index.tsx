import { useState, useMemo } from 'react'
import Head from 'next/head'
import {
  LayoutDashboard, Box, Users, BarChart2, TrendingUp, AlertTriangle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts'
import {
  SKUS, SELL_IN, CONTENEDOR_FECHA, TOTAL_CONTENEDOR,
  SKU_MAP, CONTENEDOR_MAP, CLIENTES_ORDEN,
  fmt, sellInVenta, sellInMuestras,
  siPorItem, muPorItem, stockNeto, ingPorItem, ingRow,
} from '../data/grx'

type Section = 'resumen' | 'inventario' | 'sellin' | 'facturacion' | 'skus'

const CANAL_BADGE: Record<string, string> = {
  Brick: 'badge-blue',
  'E-commerce': 'badge-purple',
}

const ESTADO_BADGE = (stock: number, min: number) => {
  if (stock <= 0)   return { label: 'Agotado', cls: 'badge-red' }
  if (stock <= min) return { label: 'Bajo',    cls: 'badge-amber' }
  return              { label: 'OK',           cls: 'badge-green' }
}

const MESES: Record<string, string> = {
  '01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun',
  '07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic',
}

function parseFecha(f: string): { year: string; month: string; mesLabel: string } {
  const [, m, y] = f.split('/')
  return { year: y, month: m, mesLabel: `${MESES[m]} ${y}` }
}

export default function Dashboard() {
  const [section, setSection] = useState<Section>('resumen')

  // Sell In filters
  const [filtroCanal, setFiltroCanal] = useState('Todos')
  const [filtroCliente, setFiltroCliente] = useState('Todos')
  const [filtroFecha, setFiltroFecha] = useState('Todas')

  // Facturación filters
  const [factClientes, setFactClientes] = useState<string[]>([])
  const [skuActivo, setSkuActivo] = useState(SKUS[0].item)

  const siRows    = sellInVenta()
  const muRows    = sellInMuestras()
  const totalSI   = siRows.reduce((a, r) => a + r.uds, 0)
  const totalSt     = SKUS.reduce((a, s) => a + stockNeto(s.item), 0)
  const valorBodega = SKUS.reduce((a, s) => a + Math.max(0, stockNeto(s.item)) * s.costo, 0)
  const totalIng  = siRows.reduce((a, r) => a + ingRow(r), 0)
  const ingBrick  = siRows.filter(r => r.canal === 'Brick').reduce((a, r) => a + ingRow(r), 0)
  const ingEcomm  = siRows.filter(r => r.canal === 'E-commerce').reduce((a, r) => a + ingRow(r), 0)
  const pctVend   = Math.round(totalSI / TOTAL_CONTENEDOR * 100)
  const skusAlerta = SKUS.filter(s => { const st = stockNeto(s.item); return st >= 0 && st < 200 })

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
    name: s.item, stock: Math.max(0, stockNeto(s.item)), min: s.stockMinimo,
  }))

  // Sell In: canales, clientes, fechas disponibles
  const canalesDisponibles = ['Todos', 'Brick', 'E-commerce']
  const clientesPorCanal = useMemo(() => {
    const base = filtroCanal === 'Todos' ? siRows : siRows.filter(r => r.canal === filtroCanal)
    return ['Todos', ...Array.from(new Set(base.map(r => r.cliente)))]
  }, [filtroCanal])

  const fechasPorCliente = useMemo(() => {
    let base = siRows
    if (filtroCanal !== 'Todos') base = base.filter(r => r.canal === filtroCanal)
    if (filtroCliente !== 'Todos') base = base.filter(r => r.cliente === filtroCliente)
    const fechas = Array.from(new Set(base.map(r => r.fecha))).sort((a, b) => {
      const [da, ma, ya] = a.split('/'); const [db, mb, yb] = b.split('/')
      return new Date(`${ya}-${ma}-${da}`).getTime() - new Date(`${yb}-${mb}-${db}`).getTime()
    })
    return ['Todas', ...fechas]
  }, [filtroCanal, filtroCliente])

  const filteredSI = useMemo(() => {
    let rows = siRows
    if (filtroCanal !== 'Todos') rows = rows.filter(r => r.canal === filtroCanal)
    if (filtroCliente !== 'Todos') rows = rows.filter(r => r.cliente === filtroCliente)
    if (filtroFecha !== 'Todas') rows = rows.filter(r => r.fecha === filtroFecha)
    return rows
  }, [filtroCanal, filtroCliente, filtroFecha])

  const filteredIng = filteredSI.reduce((a, r) => a + ingRow(r), 0)
  const filteredUds = filteredSI.reduce((a, r) => a + r.uds, 0)

  // Facturación por mes
  const todosClientesSI = Array.from(new Set(siRows.map(r => r.cliente)))

  const facturacionPorMes = useMemo(() => {
    const clientesFiltro = factClientes.length === 0 ? todosClientesSI : factClientes
    const mesMap: Record<string, { label: string; total: number; brick: number; ecomm: number }> = {}
    siRows.filter(r => clientesFiltro.includes(r.cliente)).forEach(r => {
      const { mesLabel } = parseFecha(r.fecha)
      if (!mesMap[mesLabel]) mesMap[mesLabel] = { label: mesLabel, total: 0, brick: 0, ecomm: 0 }
      const v = ingRow(r)
      mesMap[mesLabel].total += v
      if (r.canal === 'Brick') mesMap[mesLabel].brick += v
      else mesMap[mesLabel].ecomm += v
    })
    return Object.values(mesMap).sort((a, b) => {
      const meses = ['Oct 2025','Nov 2025','Dic 2025','Ene 2026','Feb 2026','Mar 2026','Abr 2026','May 2026']
      return meses.indexOf(a.label) - meses.indexOf(b.label)
    })
  }, [factClientes])

  // SKU detail
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
    { id: 'resumen',      label: 'Resumen',        icon: LayoutDashboard },
    { id: 'inventario',   label: 'Inventario',     icon: Box },
    { id: 'sellin',       label: 'Sell In',        icon: Users },
    { id: 'facturacion',  label: 'Facturación',    icon: TrendingUp },
    { id: 'skus',         label: 'Por SKU',        icon: BarChart2 },
  ] as const

  const toggleFactCliente = (cl: string) => {
    setFactClientes(prev =>
      prev.includes(cl) ? prev.filter(x => x !== cl) : [...prev, cl]
    )
  }

  return (
    <>
      <Head>
        <title>GRX Group · Dashboard Logístico</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
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

        <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto' }}>

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
                  { label: 'Total sell in',   value: totalSI.toLocaleString(),           sub: `${pctVend}% del contenedor`,         color: '#4f8ef7' },
                  { label: 'Ingreso total',   value: fmt(totalIng),                      sub: 'a precio costo MX',                  color: '#22c55e' },
                  { label: 'Canal brick',     value: fmt(ingBrick),                      sub: `${Math.round(ingBrick/totalIng*100)}% del ingreso` },
                  { label: 'E-commerce',      value: fmt(ingEcomm),                      sub: `${Math.round(ingEcomm/totalIng*100)}% del ingreso` },
                  { label: 'SKUs con alerta', value: skusAlerta.length.toString(),       sub: `de ${SKUS.length} SKUs`, color: skusAlerta.length > 0 ? '#f59e0b' : '#22c55e' },
                  { label: 'Stock actual',    value: totalSt.toLocaleString(),           sub: 'unidades en bodega' },
                  { label: 'Valor en bodega', value: fmt(valorBodega),                   sub: 'a precio costo MX',  color: '#14b8a6' },
                ].map(k => (
                  <div key={k.label} className="kpi-card">
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value" style={{ color: k.color ?? 'var(--text)', fontSize: 20 }}>{k.value}</div>
                    <div className="kpi-sub">{k.sub}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>Stock actual por SKU</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'var(--text)', fontWeight: 600 }} itemStyle={{ color: 'var(--text2)' }} formatter={(v: number) => [v.toLocaleString(), 'Stock']} />
                    <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                      {chartData.map((e, i) => (<Cell key={i} fill={e.stock <= 0 ? '#ef4444' : e.stock <= e.min ? '#f59e0b' : '#4f8ef7'} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { title: 'Canal brick',      map: brickMap, total: brickTotal, color: '#4f8ef7' },
                  { title: 'Canal e-commerce', map: ecMap,    total: ecTotal,    color: '#a78bfa' },
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
                return (
                  <div key={cat} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{cat}</div>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table>
                          <thead><tr><th>Item</th><th>UPC</th><th>Descripción</th><th>Costo</th><th>Contenedor</th><th>Sell in</th><th>Muestras</th><th>Stock</th><th>Valor bodega</th><th>% salida</th><th>Estado</th></tr></thead>
                          <tbody>
                            {skus.map(s => {
                              const si = siPorItem(s.item), mu = muPorItem(s.item), st = stockNeto(s.item)
                              const pct = Math.round((si + mu) / (CONTENEDOR_MAP[s.item] ?? 1) * 100)
                              const { label, cls } = ESTADO_BADGE(st, s.stockMinimo)
                              return (
                                <tr key={s.item}>
                                  <td style={{ fontWeight: 700 }}>{s.item}</td>
                                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>{s.upc}</td>
                                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{s.description}</td>
                                  <td>{fmt(s.costo)}</td>
                                  <td>{(CONTENEDOR_MAP[s.item] ?? 0).toLocaleString()}</td>
                                  <td style={{ color: '#4f8ef7' }}>{si.toLocaleString()}</td>
                                  <td style={{ color: '#f59e0b' }}>{mu}</td>
                                  <td style={{ fontWeight: 700, fontSize: 16, color: st <= 0 ? '#ef4444' : 'var(--text)' }}>{st.toLocaleString()}</td>
                                  <td style={{ fontWeight: 600, color: '#14b8a6' }}>{fmt(Math.max(0, st) * s.costo)}</td>
                                  <td>
                                    <div className="progress-bar" style={{ width: 70 }}><div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 70 ? '#f59e0b' : '#4f8ef7' }} /></div>
                                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{pct}%</span>
                                  </td>
                                  <td><span className={`badge ${cls}`}>{label}</span></td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── SELL IN ─────────────────────────────────────────────────── */}
          {section === 'sellin' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Sell In por cliente</h1>

              {/* Filtros */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Filtros</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Canal</label>
                    <select value={filtroCanal} onChange={e => { setFiltroCanal(e.target.value); setFiltroCliente('Todos'); setFiltroFecha('Todas') }}
                      style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }}>
                      {canalesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Cliente</label>
                    <select value={filtroCliente} onChange={e => { setFiltroCliente(e.target.value); setFiltroFecha('Todas') }}
                      style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }}>
                      {clientesPorCanal.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Fecha de facturación</label>
                    <select value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}
                      style={{ width: '100%', fontSize: 13, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)' }}>
                      {fechasPorCliente.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* KPIs del filtro */}
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
                        ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem' }}>Sin resultados con estos filtros</td></tr>
                        : filteredSI.map((r, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: 12, fontWeight: 500 }}>{r.fecha}</td>
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

          {/* ── FACTURACIÓN POR MES ─────────────────────────────────────── */}
          {section === 'facturacion' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Facturación por mes</h1>

              {/* Filtro clientes */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                  Filtrar por cliente {factClientes.length > 0 && <span style={{ color: 'var(--accent)' }}>· {factClientes.length} seleccionados</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    className={`tab-btn${factClientes.length === 0 ? ' active' : ''}`}
                    onClick={() => setFactClientes([])}>
                    Todos
                  </button>
                  {todosClientesSI.map(cl => (
                    <button key={cl}
                      className={`tab-btn${factClientes.includes(cl) ? ' active' : ''}`}
                      onClick={() => toggleFactCliente(cl)}>
                      {cl}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPIs totales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: '1.25rem' }}>
                <div className="kpi-card"><div className="kpi-label">Ingreso total</div><div className="kpi-value" style={{ fontSize: 18, color: '#22c55e' }}>{fmt(facturacionPorMes.reduce((a, m) => a + m.total, 0))}</div></div>
                <div className="kpi-card"><div className="kpi-label">Brick</div><div className="kpi-value" style={{ fontSize: 18, color: '#4f8ef7' }}>{fmt(facturacionPorMes.reduce((a, m) => a + m.brick, 0))}</div></div>
                <div className="kpi-card"><div className="kpi-label">E-commerce</div><div className="kpi-value" style={{ fontSize: 18, color: '#a78bfa' }}>{fmt(facturacionPorMes.reduce((a, m) => a + m.ecomm, 0))}</div></div>
                <div className="kpi-card"><div className="kpi-label">Meses activos</div><div className="kpi-value" style={{ fontSize: 18 }}>{facturacionPorMes.length}</div></div>
              </div>

              {/* Gráfica barras por mes */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>Ingreso mensual total</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#4f8ef7', display: 'inline-block' }}></span> Brick</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: '#a78bfa', display: 'inline-block' }}></span> E-commerce</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={facturacionPorMes} margin={{ top: 4, right: 8, left: 10, bottom: 0 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8b96ab' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8b96ab' }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number, name: string) => [fmt(v), name === 'brick' ? 'Brick' : 'E-commerce']}
                    />
                    <Bar dataKey="brick" stackId="a" fill="#4f8ef7" radius={[0,0,0,0]} />
                    <Bar dataKey="ecomm" stackId="a" fill="#a78bfa" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tabla por mes */}
              <div className="card">
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>Detalle por mes</div>
                <table>
                  <thead><tr><th>Mes</th><th>Brick</th><th>E-commerce</th><th>Total</th></tr></thead>
                  <tbody>
                    {facturacionPorMes.map(m => (
                      <tr key={m.label}>
                        <td style={{ fontWeight: 500 }}>{m.label}</td>
                        <td style={{ color: '#4f8ef7' }}>{fmt(m.brick)}</td>
                        <td style={{ color: '#a78bfa' }}>{fmt(m.ecomm)}</td>
                        <td style={{ fontWeight: 600, color: '#22c55e' }}>{fmt(m.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td style={{ color: '#4f8ef7' }}>{fmt(facturacionPorMes.reduce((a,m)=>a+m.brick,0))}</td>
                      <td style={{ color: '#a78bfa' }}>{fmt(facturacionPorMes.reduce((a,m)=>a+m.ecomm,0))}</td>
                      <td style={{ fontWeight: 700, color: '#22c55e' }}>{fmt(facturacionPorMes.reduce((a,m)=>a+m.total,0))}</td>
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
                  { label: 'Sell in',     value: skuSI.toLocaleString(),                             color: '#4f8ef7' },
                  { label: 'Muestras',    value: skuMu.toString(),                                   color: '#f59e0b' },
                  { label: 'Stock neto',  value: skuSt.toLocaleString(),                             color: skuSt <= 0 ? '#ef4444' : 'var(--text)' },
                  { label: 'Ingreso',     value: fmt(skuIng),                                        color: '#22c55e' },
                  { label: 'Costo unit.', value: fmt(skuInfo?.costo ?? 0),                           color: 'var(--text)' },
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

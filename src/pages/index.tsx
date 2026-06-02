import { useState } from 'react'
import Head from 'next/head'
import {
  LayoutDashboard, Box, Users, BarChart2, CalendarDays,
  Ship, ShoppingBag, Laptop, Gift, AlertTriangle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  SKUS, SELL_IN, CONTENEDOR_FECHA, TOTAL_CONTENEDOR,
  SKU_MAP, CONTENEDOR_MAP, CLIENTES_ORDEN,
  fmt, sellInVenta, sellInMuestras,
  siPorItem, muPorItem, stockNeto, ingPorItem, ingRow,
} from '../data/grx'

type Section = 'resumen' | 'inventario' | 'sellin' | 'skus' | 'timeline'

const CANAL_BADGE: Record<string, string> = {
  'Brick': 'badge-blue',
  'E-commerce': 'badge-purple',
}

const ESTADO_BADGE = (stock: number, min: number) => {
  if (stock <= 0)   return { label: 'Agotado', cls: 'badge-red' }
  if (stock <= min) return { label: 'Bajo',    cls: 'badge-amber' }
  return              { label: 'OK',           cls: 'badge-green' }
}

const TIMELINE_EVENTOS = [
  { fecha: '15/10/2025', icono: Ship,        label: 'Llegada del contenedor',       sub: '14,950 piezas · 12 SKUs',      color: '#4f8ef7' },
  { fecha: '17/10/2025', icono: ShoppingBag, label: 'Juguetibici — 1er pedido',     sub: '3,493 uds · Brick',            color: '#22c55e' },
  { fecha: '21/10/2025', icono: ShoppingBag, label: 'Juguetron — 1er pedido',       sub: '3,152 uds · Brick',            color: '#22c55e' },
  { fecha: '06/11/2025', icono: Laptop,      label: 'Primeras ventas Shopify',       sub: 'Inicio canal e-commerce',      color: '#a78bfa' },
  { fecha: '18/12/2025', icono: ShoppingBag, label: 'Expo Juguetron',               sub: '278 uds · Brick',              color: '#22c55e' },
  { fecha: '01/01/2026', icono: Gift,        label: 'Salida de muestras',            sub: '25 uds · sin facturar',        color: '#f59e0b' },
  { fecha: '03/02/2026', icono: Laptop,      label: 'Primeras ventas MercadoLibre', sub: 'Inicio canal Meli',            color: '#a78bfa' },
  { fecha: '25/02/2026', icono: ShoppingBag, label: 'Juguetron — 2do pedido',       sub: '1,477 uds · Brick',            color: '#22c55e' },
  { fecha: '06/03/2026', icono: ShoppingBag, label: 'Hotbook',                      sub: '25 uds · Brick',               color: '#22c55e' },
  { fecha: '20/04/2026', icono: ShoppingBag, label: "TRU's",                        sub: '634 uds · Brick',              color: '#22c55e' },
]

export default function Dashboard() {
  const [section, setSection] = useState<Section>('resumen')
  const [clienteActivo, setClienteActivo] = useState('Todos')
  const [skuActivo, setSkuActivo] = useState(SKUS[0].item)

  const siRows     = sellInVenta()
  const muRows     = sellInMuestras()
  const totalSI    = siRows.reduce((a, r) => a + r.uds, 0)
  const totalMu    = muRows.reduce((a, r) => a + r.uds, 0)
  const totalSt    = SKUS.reduce((a, s) => a + stockNeto(s.item), 0)
  const totalIng   = siRows.reduce((a, r) => a + ingRow(r), 0)
  const ingBrick   = siRows.filter(r => r.canal === 'Brick').reduce((a, r) => a + ingRow(r), 0)
  const ingEcomm   = siRows.filter(r => r.canal === 'E-commerce').reduce((a, r) => a + ingRow(r), 0)
  const pctVend    = Math.round(totalSI / TOTAL_CONTENEDOR * 100)
  const skusAlerta = SKUS.filter(s => { const st = stockNeto(s.item); return st >= 0 && st <= s.stockMinimo })

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

  const chartData = SKUS.map(s => {
    const st = stockNeto(s.item)
    return { name: s.item, stock: Math.max(0, st), min: s.stockMinimo }
  })

  const filteredSI  = (clienteActivo === 'Todos' ? SELL_IN : SELL_IN.filter(r => r.cliente === clienteActivo)).filter(r => r.uds > 0)
  const filteredIng = filteredSI.reduce((a, r) => a + ingRow(r), 0)
  const filteredUds = filteredSI.reduce((a, r) => a + r.uds, 0)

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
    { id: 'resumen',    label: 'Resumen',    icon: LayoutDashboard },
    { id: 'inventario', label: 'Inventario', icon: Box },
    { id: 'sellin',     label: 'Sell In',    icon: Users },
    { id: 'skus',       label: 'Por SKU',    icon: BarChart2 },
    { id: 'timeline',   label: 'Timeline',   icon: CalendarDays },
  ] as const

  return (
    <>
      <Head>
        <title>GRX Group · Dashboard Logístico</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <div style={{ marginBottom: '1.5rem', paddingLeft: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>GRX Group</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Dashboard logístico</div>
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
                  { label: 'Stock actual',    value: totalSt.toLocaleString(),           sub: 'unidades en bodega' },
                  { label: 'Muestras',        value: totalMu.toLocaleString(),           sub: 'sin facturar',                       color: '#f59e0b' },
                  { label: 'SKUs con alerta', value: skusAlerta.length.toString(),       sub: `de ${SKUS.length} SKUs`,             color: skusAlerta.length > 0 ? '#f59e0b' : '#22c55e' },
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
                  { title: 'Canal brick',       map: brickMap, total: brickTotal, color: '#4f8ef7' },
                  { title: 'Canal e-commerce',  map: ecMap,    total: ecTotal,    color: '#a78bfa' },
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
                          <thead><tr><th>Item</th><th>UPC</th><th>Descripción</th><th>Costo</th><th>Contenedor</th><th>Sell in</th><th>Muestras</th><th>Stock</th><th>% salida</th><th>Estado</th></tr></thead>
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

          {section === 'sellin' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Sell In por cliente</h1>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {CLIENTES_ORDEN.map(cl => (
                  <button key={cl} className={`tab-btn${clienteActivo === cl ? ' active' : ''}`} onClick={() => setClienteActivo(cl)}>{cl}</button>
                ))}
              </div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{clienteActivo === 'Todos' ? 'Todos los clientes' : clienteActivo}{' · '}<strong style={{ color: 'var(--text)' }}>{filteredUds.toLocaleString()} uds</strong></div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>Ingreso: <strong style={{ color: '#22c55e' }}>{fmt(filteredIng)}</strong></div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead><tr><th>Fecha</th><th>Item</th><th>Descripción</th><th>Cliente</th><th>Canal</th><th>Uds</th><th>Costo unit.</th><th>Ingreso</th></tr></thead>
                    <tbody>
                      {filteredSI.map((r, i) => {
                        const esMu = r.cliente === 'Muestras'
                        return (
                          <tr key={i}>
                            <td style={{ fontSize: 12 }}>{r.fecha}</td>
                            <td style={{ fontWeight: 600 }}>{r.item}</td>
                            <td style={{ fontSize: 12, color: 'var(--text2)' }}>{SKU_MAP[r.item]?.description}</td>
                            <td style={{ fontWeight: 500 }}>{r.cliente}</td>
                            <td><span className={`badge ${CANAL_BADGE[r.canal]}`}>{r.canal}</span></td>
                            <td>{r.uds.toLocaleString()}</td>
                            <td style={{ color: 'var(--text2)' }}>{fmt(SKU_MAP[r.item]?.costo ?? 0)}</td>
                            <td style={{ fontWeight: 600, color: esMu ? '#f59e0b' : '#22c55e' }}>{esMu ? '—' : fmt(ingRow(r))}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {section === 'skus' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Análisis por SKU</h1>
              <div style={{ marginBottom: 12 }}>
                <select value={skuActivo} onChange={e => setSkuActivo(e.target.value)} style={{ fontSize: 13, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text)', minWidth: 320 }}>
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

          {section === 'timeline' && (
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: '1.25rem' }}>Timeline de operaciones</h1>
              <div className="card" style={{ maxWidth: 560 }}>
                {TIMELINE_EVENTOS.map((e, i) => {
                  const Icon = e.icono
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: e.color, flexShrink: 0 }}>
                          <Icon size={14} />
                        </div>
                        {i < TIMELINE_EVENTOS.length - 1 && <div className="timeline-line" />}
                      </div>
                      <div style={{ paddingBottom: i < TIMELINE_EVENTOS.length - 1 ? 20 : 0, flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{e.fecha}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{e.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{e.sub}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}

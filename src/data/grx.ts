typescriptexport type Canal     = 'Brick' | 'E-commerce'
export type Categoria = 'Magnetic Tiles' | 'Travel Size' | 'Magnetic Brick Tiles'

export interface SKU {
  item: string
  upc: string
  description: string
  costo: number
  categoria: Categoria
  stockMinimo: number
}

export interface ContenedorRow {
  item: string
  piezas: number
}

export interface SellInRow {
  item: string
  fecha: string
  cliente: string
  canal: Canal
  uds: number
}

export const SKUS: SKU[] = [
  { item: 'PT32',     upc: '817338021962', description: '32pc Magnetic Tiles Rocket Set',               costo: 482.16,  categoria: 'Magnetic Tiles',       stockMinimo: 50 },
  { item: 'PTJ48',    upc: '817338022846', description: '48pc Magnetic Tiles in Blister',               costo: 602.84,  categoria: 'Magnetic Tiles',       stockMinimo: 50 },
  { item: 'PT61',     upc: '817338022396', description: '61pc Magnetic Tiles in Blister',               costo: 693.36,  categoria: 'Magnetic Tiles',       stockMinimo: 40 },
  { item: 'PT63',     upc: '817338023294', description: '63pc Magnetic Tiles in Blister with car base', costo: 783.88,  categoria: 'Magnetic Tiles',       stockMinimo: 40 },
  { item: 'PT60-GID', upc: '817338021450', description: '60 Glow in the Dark Tiles',                   costo: 904.57,  categoria: 'Magnetic Tiles',       stockMinimo: 30 },
  { item: 'PT80',     upc: '817338023300', description: '80pc Magnetic Tiles in Blister with car base', costo: 904.57,  categoria: 'Magnetic Tiles',       stockMinimo: 30 },
  { item: 'PT101',    upc: '817338022402', description: '101pc Magnetic Tiles in Blister',              costo: 964.91,  categoria: 'Magnetic Tiles',       stockMinimo: 20 },
  { item: 'PTM30',    upc: '817338022884', description: '30pc mini tile',                               costo: 331.29,  categoria: 'Travel Size',          stockMinimo: 60 },
  { item: 'PTM61',    upc: '817338023065', description: '61pc mini tile',                               costo: 482.16,  categoria: 'Travel Size',          stockMinimo: 80 },
  { item: 'PTM101',   upc: '817338023003', description: '101pc mini tile',                              costo: 663.19,  categoria: 'Travel Size',          stockMinimo: 40 },
  { item: 'PTL63',    upc: '817338026936', description: '63pc brick tile set',                          costo: 814.05,  categoria: 'Magnetic Brick Tiles', stockMinimo: 30 },
  { item: 'PTL333',   upc: '817338027223', description: '333pc brick tile set',                         costo: 1206.29, categoria: 'Magnetic Brick Tiles', stockMinimo: 20 },
]

export const SKU_MAP: Record<string, SKU> = Object.fromEntries(SKUS.map(s => [s.item, s]))

export const CONTENEDOR: ContenedorRow[] = [
  { item: 'PT32',     piezas: 1500 },
  { item: 'PTJ48',    piezas: 1200 },
  { item: 'PT61',     piezas: 1200 },
  { item: 'PT63',     piezas: 1000 },
  { item: 'PT60-GID', piezas:  800 },
  { item: 'PT80',     piezas:  800 },
  { item: 'PT101',    piezas:  600 },
  { item: 'PTM30',    piezas: 1800 },
  { item: 'PTM61',    piezas: 4000 },
  { item: 'PTM101',   piezas: 1200 },
  { item: 'PTL63',    piezas:  600 },
  { item: 'PTL333',   piezas:  250 },
]

export const CONTENEDOR_FECHA = '15/10/2025'
export const CONTENEDOR_MAP: Record<string, number> = Object.fromEntries(CONTENEDOR.map(r => [r.item, r.piezas]))
export const TOTAL_CONTENEDOR = CONTENEDOR.reduce((a, r) => a + r.piezas, 0)

export const SELL_IN: SellInRow[] = [
  { item: 'PT32',     fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  456 },
  { item: 'PTJ48',    fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  420 },
  { item: 'PT61',     fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  456 },
  { item: 'PT63',     fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  380 },
  { item: 'PT60-GID', fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  216 },
  { item: 'PT80',     fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  216 },
  { item: 'PT101',    fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  210 },
  { item: 'PTM30',    fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  534 },
  { item: 'PTM61',    fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  960 },
  { item: 'PTM101',   fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  414 },
  { item: 'PTL63',    fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  126 },
  { item: 'PTL333',   fecha: '17/10/2025', cliente: 'Juguetibici',    canal: 'Brick',      uds:  105 },
  { item: 'PT32',     fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  486 },
  { item: 'PTJ48',    fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  318 },
  { item: 'PT61',     fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  312 },
  { item: 'PT63',     fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  210 },
  { item: 'PT60-GID', fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  280 },
  { item: 'PT80',     fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  280 },
  { item: 'PT101',    fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  171 },
  { item: 'PTM30',    fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  642 },
  { item: 'PTM61',    fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  880 },
  { item: 'PTM101',   fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  264 },
  { item: 'PTL63',    fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  204 },
  { item: 'PTL333',   fecha: '21/10/2025', cliente: 'Juguetron',      canal: 'Brick',      uds:  105 },
  { item: 'PTM30',    fecha: '10/11/2025', cliente: 'Shopify',        canal: 'E-commerce', uds:    1 },
  { item: 'PTJ48',    fecha: '25/11/2025', cliente: 'Shopify',        canal: 'E-commerce', uds:    1 },
  { item: 'PTM30',    fecha: '26/11/2025', cliente: 'Shopify',        canal: 'E-commerce', uds:    1 },
  { item: 'PT80',     fecha: '12/12/2025', cliente: 'Shopify',        canal: 'E-commerce', uds:    1 },
  { item: 'PT60-GID', fecha: '13/12/2025', cliente: 'Shopify',        canal: 'E-commerce', uds:    1 },
  { item: 'PTM61',    fecha: '19/12/2025', cliente: 'Shopify',        canal: 'E-commerce', uds:    1 },
  { item: 'PTJ48',    fecha: '24/12/2025', cliente: 'Shopify',        canal: 'E-commerce', uds:    1 },
  { item: 'PTL333',   fecha: '26/12/2025', cliente: 'Shopify',        canal: 'E-commerce', uds:    1 },
  { item: 'PT32',     fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   21 },
  { item: 'PTJ48',    fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   10 },
  { item: 'PT61',     fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   10 },
  { item: 'PT63',     fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   23 },
  { item: 'PT60-GID', fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   17 },
  { item: 'PT80',     fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   44 },
  { item: 'PT101',    fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   39 },
  { item: 'PTM30',    fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   16 },
  { item: 'PTM61',    fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   34 },
  { item: 'PTM101',   fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   21 },
  { item: 'PTL63',    fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   19 },
  { item: 'PTL333',   fecha: '18/12/2025', cliente: 'Expo Juguetron', canal: 'Brick',      uds:   25 },
  { item: 'PT32',     fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    2 },
  { item: 'PTJ48',    fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    3 },
  { item: 'PT61',     fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    1 },
  { item: 'PT63',     fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    3 },
  { item: 'PT60-GID', fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    1 },
  { item: 'PT80',     fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    2 },
  { item: 'PT101',    fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    5 },
  { item: 'PTM30',    fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    3 },
  { item: 'PTM61',    fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    5 },
  { item: 'PTM101',   fecha: '01/01/2026', cliente: 'Muestras',       canal: 'Brick',      uds:    2 },
  { item: 'PTJ48',    fecha: '12/01/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM30',    fecha: '15/02/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM30',    fecha: '15/02/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PT32',     fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  216 },
  { item: 'PTJ48',    fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  114 },
  { item: 'PT61',     fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  132 },
  { item: 'PT63',     fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  130 },
  { item: 'PT60-GID', fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  128 },
  { item: 'PT80',     fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  192 },
  { item: 'PT101',    fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  135 },
  { item: 'PTM30',    fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  120 },
  { item: 'PTM61',    fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  260 },
  { item: 'PTM101',   fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:  120 },
  { item: 'PTL63',    fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   60 },
  { item: 'PTL333',   fecha: '25/02/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   10 },
  { item: 'PTM61',    fecha: '25/02/2026', cliente: 'Walmart',        canal: 'E-commerce', uds:    1 },
  { item: 'PT60-GID', fecha: '03/03/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PT60-GID', fecha: '04/03/2026', cliente: 'Nelo',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM30',    fecha: '04/03/2026', cliente: 'Nelo',           canal: 'E-commerce', uds:    1 },
  { item: 'PT32',     fecha: '06/03/2026', cliente: 'Hotbook',        canal: 'Brick',      uds:    1 },
  { item: 'PTJ48',    fecha: '06/03/2026', cliente: 'Hotbook',        canal: 'Brick',      uds:    3 },
  { item: 'PT63',     fecha: '06/03/2026', cliente: 'Hotbook',        canal: 'Brick',      uds:    1 },
  { item: 'PT60-GID', fecha: '06/03/2026', cliente: 'Hotbook',        canal: 'Brick',      uds:    1 },
  { item: 'PT80',     fecha: '06/03/2026', cliente: 'Hotbook',        canal: 'Brick',      uds:    1 },
  { item: 'PTM30',    fecha: '06/03/2026', cliente: 'Hotbook',        canal: 'Brick',      uds:   10 },
  { item: 'PTM61',    fecha: '06/03/2026', cliente: 'Hotbook',        canal: 'Brick',      uds:    2 },
  { item: 'PTM101',   fecha: '06/03/2026', cliente: 'Hotbook',        canal: 'Brick',      uds:    6 },
  { item: 'PTL333',   fecha: '06/03/2026', cliente: 'Hotbook',        canal: 'Brick',      uds:    1 },
  { item: 'PTM30',    fecha: '22/03/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM30',    fecha: '05/04/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTL333',   fecha: '07/04/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM61',    fecha: '12/04/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM61',    fecha: '19/04/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PT32',     fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   54 },
  { item: 'PTJ48',    fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   54 },
  { item: 'PT61',     fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   54 },
  { item: 'PT63',     fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   45 },
  { item: 'PT60-GID', fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   72 },
  { item: 'PT80',     fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   40 },
  { item: 'PT101',    fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   27 },
  { item: 'PTM30',    fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   54 },
  { item: 'PTM61',    fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:  180 },
  { item: 'PTM101',   fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   54 },
  { item: 'PTL63',    fecha: '20/04/2026', cliente: "TRU's",          canal: 'Brick',      uds:   54 },
  { item: 'PT80',     fecha: '21/04/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    2 },
  { item: 'PTM61',    fecha: '24/04/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM30',    fecha: '24/04/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PT60-GID', fecha: '29/04/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM30',    fecha: '09/05/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTL333',   fecha: '13/05/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM30',    fecha: '19/05/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PTM61',    fecha: '24/05/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PT60-GID', fecha: '25/05/2026', cliente: 'Meli',           canal: 'E-commerce', uds:    1 },
  { item: 'PT32',     fecha: '29/05/2026', cliente: 'Muestras',       canal: 'E-commerce', uds:    1 },
  { item: 'PT61',     fecha: '05/06/2026', cliente: "TRU's",          canal: 'Brick',      uds:    1 },
  { item: 'PT32',     fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PTJ48',    fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PT63',     fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PT60-GID', fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PT80',     fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PT101',    fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PTM30',    fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PTM61',    fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PTM101',   fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PTL63',    fecha: '16/06/2026', cliente: 'Gina',           canal: 'Brick',      uds:    1 },
  { item: 'PTM61',    fecha: '28/06/2026', cliente: 'Meli',           canal: 'Brick',      uds:    1 },
  { item: 'PT32',     fecha: '30/06/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   18 },
  { item: 'PTJ48',    fecha: '30/06/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   24 },
  { item: 'PT61',     fecha: '30/06/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   42 },
  { item: 'PT63',     fecha: '30/06/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   65 },
  { item: 'PT60-GID', fecha: '30/06/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   32 },
  { item: 'PTM30',    fecha: '30/06/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   66 },
  { item: 'PTM61',    fecha: '30/06/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   60 },
  { item: 'PTM101',   fecha: '30/06/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   30 },
  { item: 'PTL63',    fecha: '30/06/2026', cliente: 'Juguetron',      canal: 'Brick',      uds:   84 },
]

export const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-MX')

export const sellInVenta    = () => SELL_IN.filter(r => r.cliente !== 'Muestras' && r.uds > 0)
export const sellInMuestras = () => SELL_IN.filter(r => r.cliente === 'Muestras' && r.uds > 0)

export const siPorItem  = (item: string) => sellInVenta().filter(r => r.item === item).reduce((a, r) => a + r.uds, 0)
export const muPorItem  = (item: string) => sellInMuestras().filter(r => r.item === item).reduce((a, r) => a + r.uds, 0)
export const stockNeto  = (item: string) => (CONTENEDOR_MAP[item] ?? 0) - siPorItem(item) - muPorItem(item)
export const ingPorItem = (item: string) => sellInVenta().filter(r => r.item === item).reduce((a, r) => a + (SKU_MAP[r.item]?.costo ?? 0) * r.uds, 0)
export const ingRow     = (r: SellInRow) => (SKU_MAP[r.item]?.costo ?? 0) * r.uds

export const CLIENTES_ORDEN = ['Todos', ...Array.from(new Set(SELL_IN.map(r => r.cliente)))]
GitHub → src/data/grx.ts → lápiz ✏️ → Ctrl+A → borra → pega → Commit. 205 líneas.
Avísame cuando esté y te paso el index.tsx.

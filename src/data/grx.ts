export type Canal = 'Brick' | 'E-commerce'
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
export const CONTENEDOR_MAP: Record<string, numb

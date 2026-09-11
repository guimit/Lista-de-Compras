export const LISTAS_KEY = '@lista_compras:listas';
export const LISTA_ATIVA_KEY = '@lista_compras:lista_ativa';

export const itemsKey = (listaId: string) => `@lista_compras:items:${listaId}`;
export const historicoNomesKey = (listaId: string) => `@lista_compras:historico_nomes:${listaId}`;
export const comprasKey = (listaId: string) => `@lista_compras:historico_compras:${listaId}`;
export const produtosKey = (listaId: string) => `@lista_compras:historico_precos:${listaId}`;

// Chaves antigas (pré multi-lista) — lidas uma única vez pela migração e depois apagadas.
export const LEGACY_ITEMS_KEY = '@lista_compras:items';
export const LEGACY_HISTORY_KEY = '@lista_compras:history';
export const LEGACY_COMPRAS_KEY = '@lista_compras:historico_compras';
export const LEGACY_PRODUTOS_KEY = '@lista_compras:historico_precos';

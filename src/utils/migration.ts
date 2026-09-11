import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lista } from '../types';
import {
  LEGACY_COMPRAS_KEY,
  LEGACY_HISTORY_KEY,
  LEGACY_ITEMS_KEY,
  LEGACY_PRODUTOS_KEY,
  LISTAS_KEY,
  LISTA_ATIVA_KEY,
  comprasKey,
  historicoNomesKey,
  itemsKey,
  produtosKey,
} from './storageKeys';

export const DEFAULT_LISTA_ID = 'supermercado-default';

// Move os dados da app pré multi-lista para a lista "Supermercado". Também cobre a
// instalação nova, já que sem chaves antigas produz a mesma lista por omissão vazia.
export async function migrateLegacyDataToListas(): Promise<Lista> {
  const [[, rawItems], [, rawHistory], [, rawCompras], [, rawProdutos]] = await AsyncStorage.multiGet([
    LEGACY_ITEMS_KEY,
    LEGACY_HISTORY_KEY,
    LEGACY_COMPRAS_KEY,
    LEGACY_PRODUTOS_KEY,
  ]);

  const defaultLista: Lista = {
    id: DEFAULT_LISTA_ID,
    nome: 'Supermercado',
    lojas: ['Intermarché', 'Pingo Doce', 'Continente', 'Lidl', 'Aldi'],
    criadaEm: Date.now(),
    ordem: 0,
  };

  await AsyncStorage.multiSet([
    [itemsKey(DEFAULT_LISTA_ID), rawItems ?? '[]'],
    [historicoNomesKey(DEFAULT_LISTA_ID), rawHistory ?? '[]'],
    [comprasKey(DEFAULT_LISTA_ID), rawCompras ?? '[]'],
    [produtosKey(DEFAULT_LISTA_ID), rawProdutos ?? '[]'],
  ]);

  await AsyncStorage.setItem(LISTAS_KEY, JSON.stringify([defaultLista]));
  await AsyncStorage.setItem(LISTA_ATIVA_KEY, DEFAULT_LISTA_ID);

  await AsyncStorage.multiRemove([
    LEGACY_ITEMS_KEY,
    LEGACY_HISTORY_KEY,
    LEGACY_COMPRAS_KEY,
    LEGACY_PRODUTOS_KEY,
  ]);

  return defaultLista;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Lista } from '../types';
import { migrateLegacyDataToListas } from '../utils/migration';
import { LISTAS_KEY, LISTA_ATIVA_KEY, comprasKey, historicoNomesKey, itemsKey, produtosKey } from '../utils/storageKeys';

const NOME_MIN = 2;
const NOME_MAX = 20;
const LOJA_MIN = 2;
const LOJA_MAX = 30;

interface UseListasReturn {
  listas: Lista[];
  listaAtiva: Lista;
  listaAtivaId: string;
  setListaAtiva: (id: string) => void;
  criarLista: (nome: string, lojas: string[]) => Promise<void>;
  apagarLista: (id: string) => Promise<void>;
  loading: boolean;
}

const ListasContext = createContext<UseListasReturn | null>(null);

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function validarNovaLista(nome: string, lojas: string[], listasExistentes: Lista[]) {
  const nomeTrim = nome.trim();
  if (nomeTrim.length < NOME_MIN || nomeTrim.length > NOME_MAX) {
    throw new Error(`O nome da lista deve ter entre ${NOME_MIN} e ${NOME_MAX} caracteres.`);
  }
  const duplicado = listasExistentes.some((l) => l.nome.trim().toLowerCase() === nomeTrim.toLowerCase());
  if (duplicado) {
    throw new Error('Já existe uma lista com este nome.');
  }
  if (lojas.length < 1) {
    throw new Error('Adiciona pelo menos uma loja.');
  }
  for (const loja of lojas) {
    const trim = loja.trim();
    if (trim.length < LOJA_MIN || trim.length > LOJA_MAX) {
      throw new Error(`O nome da loja deve ter entre ${LOJA_MIN} e ${LOJA_MAX} caracteres.`);
    }
  }
}

function useListasState(): UseListasReturn {
  const [listas, setListas] = useState<Lista[]>([]);
  const [listaAtivaId, setListaAtivaId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const rawListas = await AsyncStorage.getItem(LISTAS_KEY);
      if (rawListas === null) {
        const defaultLista = await migrateLegacyDataToListas();
        if (!active) return;
        setListas([defaultLista]);
        setListaAtivaId(defaultLista.id);
        return;
      }

      const parsed = parseJson<Lista[]>(rawListas, []).sort((a, b) => a.ordem - b.ordem);
      const rawAtiva = await AsyncStorage.getItem(LISTA_ATIVA_KEY);
      const valida = !!rawAtiva && parsed.some((l) => l.id === rawAtiva);
      const resolvida = valida ? rawAtiva! : (parsed[0]?.id ?? '');
      if (!active) return;
      setListas(parsed);
      setListaAtivaId(resolvida);
      if (!valida && resolvida) AsyncStorage.setItem(LISTA_ATIVA_KEY, resolvida).catch(() => {});
    })().finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const listaAtiva = useMemo(
    () => listas.find((l) => l.id === listaAtivaId) ?? listas[0],
    [listas, listaAtivaId],
  );

  const setListaAtiva = useCallback(
    (id: string) => {
      if (!listas.some((l) => l.id === id)) return;
      setListaAtivaId(id);
      AsyncStorage.setItem(LISTA_ATIVA_KEY, id).catch(() => {});
    },
    [listas],
  );

  const criarLista = useCallback(
    async (nome: string, lojas: string[]) => {
      validarNovaLista(nome, lojas, listas);
      const novaLista: Lista = {
        id: Crypto.randomUUID(),
        nome: nome.trim(),
        lojas: lojas.map((l) => l.trim()),
        criadaEm: Date.now(),
        ordem: listas.length === 0 ? 0 : Math.max(...listas.map((l) => l.ordem)) + 1,
      };
      const novoArray = [...listas, novaLista];
      await AsyncStorage.setItem(LISTAS_KEY, JSON.stringify(novoArray));
      await AsyncStorage.setItem(LISTA_ATIVA_KEY, novaLista.id);
      setListas(novoArray);
      setListaAtivaId(novaLista.id);
    },
    [listas],
  );

  const apagarLista = useCallback(
    async (id: string) => {
      if (listas.length <= 1) return;
      if (!listas.some((l) => l.id === id)) return;

      await AsyncStorage.multiRemove([itemsKey(id), historicoNomesKey(id), comprasKey(id), produtosKey(id)]);

      const novoArray = listas.filter((l) => l.id !== id);
      await AsyncStorage.setItem(LISTAS_KEY, JSON.stringify(novoArray));
      setListas(novoArray);

      if (id === listaAtivaId) {
        const fallback = novoArray[0].id;
        await AsyncStorage.setItem(LISTA_ATIVA_KEY, fallback);
        setListaAtivaId(fallback);
      }
    },
    [listas, listaAtivaId],
  );

  return { listas, listaAtiva, listaAtivaId, setListaAtiva, criarLista, apagarLista, loading };
}

export function ListasProvider({ children }: { children: React.ReactNode }) {
  const value = useListasState();
  if (value.loading) return null;
  return <ListasContext.Provider value={value}>{children}</ListasContext.Provider>;
}

export function useListas(): UseListasReturn {
  const ctx = useContext(ListasContext);
  if (!ctx) throw new Error('useListas must be used inside ListasProvider');
  return ctx;
}

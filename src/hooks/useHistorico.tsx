import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CompraArquivada, Mercado, ProdutoHistorico, ShoppingItem } from '../types';
import { comprasKey, produtosKey } from '../utils/storageKeys';
import { useListas } from './useListas';

const MERCADO_LIMIT = 3;

export interface PrecoStats {
  geral: number;
  mercados: { mercado: Mercado; media: number }[];
}

interface HistoricoState {
  loaded: boolean;
  compras: CompraArquivada[];
  arquivarCompra: (mercado: Mercado, itens: ShoppingItem[]) => CompraArquivada;
  getPrecoStats: (nome: string) => PrecoStats | null;
  getCompra: (id: string) => CompraArquivada | null;
}

const HistoricoContext = createContext<HistoricoState | null>(null);

// Normalização usada em todas as comparações de produto (case-insensitive, sem espaços nas pontas).
const norm = (nome: string) => nome.trim().toLowerCase();

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function useHistoricoState(): HistoricoState {
  const { listaAtivaId } = useListas();
  const [compras, setCompras] = useState<CompraArquivada[]>([]);
  const [produtos, setProdutos] = useState<ProdutoHistorico[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Rastreia de qual lista os `compras`/`produtos` em memória realmente vieram, para os efeitos de
  // persistência abaixo não gravarem dados da lista anterior sob a chave da lista recém-selecionada
  // enquanto o carregamento assíncrono da lista nova ainda está em andamento.
  const loadedListaIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    AsyncStorage.multiGet([comprasKey(listaAtivaId), produtosKey(listaAtivaId)])
      .then(([[, rawCompras], [, rawProdutos]]) => {
        if (!active) return;
        setCompras(parseJson<CompraArquivada[]>(rawCompras, []));
        setProdutos(parseJson<ProdutoHistorico[]>(rawProdutos, []));
        loadedListaIdRef.current = listaAtivaId;
      })
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [listaAtivaId]);

  // Só persiste depois do carregamento inicial, para não sobrescrever o storage com o estado vazio,
  // e só quando `compras`/`produtos` já pertencem à lista ativa atual (evita gravar dados da lista
  // anterior sob a chave da lista nova durante a corrida da troca de lista).
  useEffect(() => {
    if (loaded && loadedListaIdRef.current === listaAtivaId) {
      AsyncStorage.setItem(comprasKey(listaAtivaId), JSON.stringify(compras)).catch(() => {});
    }
  }, [compras, loaded, listaAtivaId]);

  useEffect(() => {
    if (loaded && loadedListaIdRef.current === listaAtivaId) {
      AsyncStorage.setItem(produtosKey(listaAtivaId), JSON.stringify(produtos)).catch(() => {});
    }
  }, [produtos, loaded, listaAtivaId]);

  const arquivarCompra = useCallback((mercado: Mercado, itens: ShoppingItem[]): CompraArquivada => {
    const data = Date.now();
    const snap = itens.map((it) => ({ ...it }));
    const total = snap.reduce((sum, it) => sum + (it.price ?? 0) * (it.quantity ?? 0), 0);
    const compra: CompraArquivada = { id: Crypto.randomUUID(), data, mercado, itens: snap, total };

    setCompras((prev) => [compra, ...prev]);

    setProdutos((prev) => {
      const next = prev.map((p) => ({ ...p, ocorrencias: [...p.ocorrencias] }));
      for (const it of snap) {
        if (it.price == null || it.quantity == null) continue; // checked implica ambos; defesa extra
        const nomeTrim = it.name.trim();
        const chave = nomeTrim.toLowerCase();
        const ocorrencia = { mercado, preco: it.price, data }; // preco = preço unitário
        const existente = next.find((p) => norm(p.nome) === chave);
        if (existente) existente.ocorrencias.push(ocorrencia);
        else next.push({ nome: nomeTrim, ocorrencias: [ocorrencia] });
      }
      return next;
    });

    return compra;
  }, []);

  const getPrecoStats = useCallback(
    (nome: string): PrecoStats | null => {
      const chave = norm(nome);
      const produto = produtos.find((p) => norm(p.nome) === chave);
      if (!produto || produto.ocorrencias.length === 0) return null;

      const precos = produto.ocorrencias.map((o) => o.preco);
      const geral = precos.reduce((sum, v) => sum + v, 0) / precos.length;

      const porMercado = new Map<Mercado, { soma: number; n: number; ultima: number }>();
      for (const o of produto.ocorrencias) {
        const atual = porMercado.get(o.mercado) ?? { soma: 0, n: 0, ultima: 0 };
        atual.soma += o.preco;
        atual.n += 1;
        atual.ultima = Math.max(atual.ultima, o.data);
        porMercado.set(o.mercado, atual);
      }

      const mercados = [...porMercado.entries()]
        .map(([mercado, v]) => ({ mercado, media: v.soma / v.n, ultima: v.ultima }))
        .sort((a, b) => b.ultima - a.ultima) // mercado mais recente primeiro
        .slice(0, MERCADO_LIMIT)
        .map(({ mercado, media }) => ({ mercado, media }));

      return { geral, mercados };
    },
    [produtos],
  );

  const getCompra = useCallback(
    (id: string) => compras.find((c) => c.id === id) ?? null,
    [compras],
  );

  return { loaded, compras, arquivarCompra, getPrecoStats, getCompra };
}

export function HistoricoProvider({ children }: { children: React.ReactNode }) {
  const value = useHistoricoState();
  return <HistoricoContext.Provider value={value}>{children}</HistoricoContext.Provider>;
}

export function useHistorico(): HistoricoState {
  const ctx = useContext(HistoricoContext);
  if (!ctx) throw new Error('useHistorico must be used inside HistoricoProvider');
  return ctx;
}

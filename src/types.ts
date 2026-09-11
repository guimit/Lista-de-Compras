export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  price?: number; // preço unitário em €
  quantity?: number;
  checkedAt?: number; // timestamp
}

export type Mercado = string; // loja, definida por lista (Lista.lojas)

export interface Lista {
  id: string;
  nome: string;
  lojas: string[];
  criadaEm: number; // timestamp
  ordem: number; // posição no tab bar
}

export interface CompraArquivada {
  id: string;
  data: number; // Date.now() no momento de arquivar
  mercado: Mercado;
  itens: ShoppingItem[]; // snapshot (cópia) dos itens comprados
  total: number; // Σ price*quantity de itens
}

export interface ProdutoHistorico {
  nome: string; // nome original (trim) tal como visto pela primeira vez
  ocorrencias: { mercado: Mercado; preco: number; data: number }[]; // preco = preço unitário
}

export type RootStackParamList = {
  Home: undefined;
  History: undefined; // "Frequentes" — re-adicionar produtos já comprados
  Historico: undefined; // compras arquivadas
  DetalheCompra: { compraId: string };
};

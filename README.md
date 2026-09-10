# 🛒 Lista de Compras

> ⚠️ **Este projeto foi desenvolvido 100% com Inteligência Artificial, usando o [Claude Code](https://claude.com/claude-code).** Todo o código, arquitetura, componentes e configuração de build foram gerados por IA.

Aplicação móvel de lista de compras, feita em React Native com Expo. Permite criar uma lista, marcar itens como comprados indicando preço e quantidade, acompanhar o total gasto em tempo real, concluir a compra escolhendo o supermercado e consultar o histórico de compras arquivadas. Ao longo do tempo a app aprende os preços de cada produto e sugere a média paga — geral e por mercado.

## Funcionalidades

- **Adicionar itens** à lista com um campo de texto simples e rápido.
- **Sugestões automáticas** ao digitar, baseadas no histórico de itens já comprados.
- **Marcar como comprado** através de um modal que pede preço unitário e quantidade, calculando o subtotal do item.
- **Sugestões de preço médio** no modal de marcação: mostra o preço médio geral do produto e a média nos mercados mais recentes (até 3), com base nas compras anteriores.
- **Concluir compra** escolhendo o mercado (Intermarché, Pingo Doce, Continente, Lidl ou Aldi). Os itens comprados são arquivados e saem da lista; os que ficaram por comprar permanecem para a próxima vez.
- **Histórico de compras** numa tela dedicada: lista das compras arquivadas por data, com mercado, total e nº de itens; toque numa compra para ver o detalhe (recibo só de leitura).
- **Resumo do carrinho** com total em euros (€) e contagem de itens, sempre visível no rodapé.
- **Apagar itens** com gesto de deslizar (swipe-to-delete).
- **Desmarcar itens** comprados, voltando-os para a lista pendente.
- **Nova lista** com confirmação, que limpa os itens mas mantém o histórico.
- **Frequentes**: tela que lista os produtos já comprados antes, permitindo readicioná-los à lista com um toque.
- **Layout adaptativo** para telas largas/dispositivos dobráveis (ex.: Galaxy Fold aberto), exibindo lista pendente e itens comprados lado a lado a partir de 600dp de largura.
- **Persistência local** de itens, histórico, compras arquivadas e histórico de preços via `AsyncStorage`, sem necessidade de internet ou conta de usuário.

## Tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | [Expo](https://expo.dev) `~57.0.20` / React Native `0.86.3` |
| Linguagem | TypeScript |
| UI | React `19.2.3` |
| Navegação | React Navigation (Stack) |
| Ícones | @expo/vector-icons (Ionicons) |
| Gestos/Animações | react-native-gesture-handler + react-native-reanimated |
| Armazenamento local | @react-native-async-storage/async-storage |
| IDs únicos | expo-crypto (`randomUUID`) |
| Build/Distribuição | EAS Build (perfis `development`, `preview`, `production`) |
| CI | GitHub Actions (build automático de APK) |

## Estrutura do projeto

```
├── App.tsx                     # Setup de navegação, providers e tema
├── index.ts                    # Entry point (registerRootComponent)
├── src/
│   ├── components/
│   │   ├── AddItemInput.tsx        # Campo de adicionar item + sugestões
│   │   ├── CartSummary.tsx         # Total do carrinho + "Nova lista" e "Concluir compra"
│   │   ├── CenteredDialog.tsx      # Base compartilhada dos diálogos centrados
│   │   ├── CheckoutModal.tsx       # Modal de preço/quantidade ao marcar item
│   │   ├── EditItemModal.tsx       # Modal de edição de item
│   │   ├── MercadoModal.tsx        # Escolha do mercado ao concluir a compra
│   │   ├── PrecoSugestao.tsx       # Preço médio (geral + por mercado) no CheckoutModal
│   │   └── ItemRow.tsx             # Linha de item com swipe (editar/apagar)
│   ├── hooks/
│   │   ├── useShoppingList.tsx     # Estado da lista (Context) + persistência + concluirCompra
│   │   └── useHistorico.tsx        # Compras arquivadas e histórico de preços (Context)
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Tela principal (lista + layout adaptativo)
│   │   ├── HistoryScreen.tsx       # "Frequentes" — readicionar produtos já comprados
│   │   ├── HistoricoScreen.tsx     # Lista de compras arquivadas
│   │   └── DetalheCompraScreen.tsx # Detalhe (recibo) de uma compra arquivada
│   ├── theme.ts                    # Cores, tipografia, espaçamentos, helpers (formatEuro, formatData)
│   └── types.ts                    # Tipos compartilhados (ShoppingItem, Mercado, CompraArquivada, rotas)
├── assets/                      # Ícones, splash e favicon
├── app.json                     # Configuração do Expo
├── eas.json                     # Perfis de build do EAS
└── .github/workflows/build-apk.yml  # CI para gerar APK Android
```

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) e o app [Expo Go](https://expo.dev/go) (ou emulador Android/iOS).

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start

# Ou diretamente numa plataforma
npm run android
npm run ios
npm run web
```

## Build (APK Android)

O build é feito via [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
eas build --platform android --profile preview
```

O workflow em `.github/workflows/build-apk.yml` também gera o APK automaticamente a cada push na branch `main` (requer o secret `EXPO_TOKEN` configurado no repositório).

## Licença

Distribuído sob a licença MIT (ver arquivo [LICENSE](./LICENSE)).

---

<sub>Desenvolvido inteiramente com [Claude Code](https://claude.com/claude-code), da Anthropic.</sub>

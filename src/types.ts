export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  price?: number; // preço unitário em €
  quantity?: number;
  checkedAt?: number; // timestamp
}

export type RootStackParamList = {
  Home: undefined;
  History: undefined;
};

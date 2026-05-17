export interface TransactionItem {
  id: string;
  gameTitle: string;
  itemName: string;
  price: number;
  status: 'success' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
}
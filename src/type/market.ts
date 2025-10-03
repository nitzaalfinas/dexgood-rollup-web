// Market type definition
export interface Market {
  market_id_bc: string;
  chain_id: number;
  sc_address: string;
  name: string;
  symbol: string;
  price?: number;
  volume?: number;
  change?: number;
}
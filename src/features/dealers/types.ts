export interface Dealer {
  id: number;
  username: string;
  pin: string;
  name: string;
  active: boolean;
}

export interface DealerInput {
  username: string;
  pin: string;
  name: string;
}

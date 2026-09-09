export interface Route {
  id: number;
  name: string;
  color: string | null;
  dealer_username: string | null;
  active: boolean;
}

export interface RouteInput {
  name: string;
  color: string;
  dealer_username: string | null;
}

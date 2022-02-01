export interface Option<V = any> {
  name: string;
  value: V;
  disabled?: boolean;
}

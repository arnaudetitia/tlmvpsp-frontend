export interface ImporError {
  ligne: number;
  type: 'error' | 'warning';
  message: string;
}

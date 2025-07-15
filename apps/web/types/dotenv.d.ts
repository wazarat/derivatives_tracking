declare module 'dotenv' {
  export function config(options?: { path?: string }): void;
  export const parse: any;
  export const load: any;
}

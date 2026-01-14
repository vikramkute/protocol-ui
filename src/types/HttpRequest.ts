/**
 * Custom type declaration representing a Protocol request.
 */
export type HttpRequest = {
  id: string;
  url: string;
  method?: string;
  headers?: {};
  body?: string;
  response?: {
    status: number;
    headers?: {};
    body?: string;
  };
};

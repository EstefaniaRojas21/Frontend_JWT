export interface JwtResponse {
  success: boolean;
  jwt?: string;
  header?: any;
  payload?: any;
  signature?: string;
  algorithm?: string;
  method?: string;
  warnings?: string[];
  error?: string;
}


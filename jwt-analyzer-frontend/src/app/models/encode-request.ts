export interface EncodeRequest {
  payload: any;
  secret: string;
  algorithm?: string;
  expires_in?: number;
  use_pyjwt?: boolean;
  validate_secret?: boolean;
}


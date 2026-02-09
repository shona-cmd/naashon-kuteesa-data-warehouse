declare module 'speakeasy' {
  export interface Secret {
    ascii: string;
    base32: string;
    hex: string;
    otpauth_url: string;
  }

  export interface GeneratedSecret extends Secret {
    qr_code_ascii: string;
    qr_code_hex: string;
    qr_code_base32: string;
  }

  export function generateSecret(options?: {
    name?: string;
    issuer?: string;
    length?: number;
  }): GeneratedSecret;

  export function totp(options: {
    secret: string;
    encoding?: string;
    token?: string;
    window?: number;
  }): boolean;

  export function verify(options: {
    secret: string;
    encoding?: string;
    token?: string;
    window?: number;
  }): boolean;

  export function time(): number;
}


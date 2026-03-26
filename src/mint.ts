import { HttpTransport } from './transport';

export class MintNamespace {
  constructor(
    private transport: HttpTransport,
    private prefix: string,
  ) {}

  /** AUTH — Authenticate the connection */
  async auth(token: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${token}`, );
  }

  /** CA_CREATE — Create a new Certificate Authority */
  async caCreate(ca: string, algorithm: string, subject: string, ttl_days: number, options?: {
    parent?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${ca}`, { verb: 'CA_CREATE', ...options });
  }

  /** CA_EXPORT — Export the CA's public certificate */
  async caExport(ca: string, options?: {
    format?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${ca}`, );
  }

  /** CA_INFO — Get information about a CA */
  async caInfo(ca: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${ca}`, );
  }

  /** CA_LIST — List all CAs */
  async caList(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/CA_LIST`);
  }

  /** CA_ROTATE — Rotate the CA's signing key */
  async caRotate(ca: string, options?: {
    force?: string;
    dryrun?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${ca}`, { verb: 'CA_ROTATE', ...options });
  }

  /** CRL_INFO — Get CRL information for a CA */
  async crlInfo(ca: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${ca}`, );
  }

  /** HEALTH — Check server health */
  async health(ca: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${ca}`, );
  }

  /** INSPECT — Inspect a certificate */
  async inspect(ca: string, serial: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${ca}`, );
  }

  /** ISSUE — Issue a new certificate */
  async issue(ca: string, subject: string, profile: string, options?: {
    ttl?: string;
    san_dns?: string;
    san_ip?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${ca}`, { verb: 'ISSUE', ...options });
  }

  /** ISSUE_FROM_CSR — Issue a certificate from a CSR */
  async issueFromCsr(ca: string, csr_pem: string, profile: string, options?: {
    ttl?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${ca}`, { verb: 'ISSUE_FROM_CSR', ...options });
  }

  /** LIST_CERTS — List certificates for a CA */
  async listCerts(ca: string, options?: {
    state?: string;
    limit?: string;
    offset?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${ca}`, );
  }

  /** RENEW — Renew a certificate */
  async renew(ca: string, serial: string, options?: {
    ttl?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${ca}`, { verb: 'RENEW', ...options });
  }

  /** REVOKE — Revoke a certificate */
  async revoke(ca: string, serial: string, options?: {
    reason?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${ca}`, { verb: 'REVOKE', ...options });
  }

}

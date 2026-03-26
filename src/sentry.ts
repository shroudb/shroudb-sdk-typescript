import { HttpTransport } from './transport';

export class SentryNamespace {
  constructor(
    private transport: HttpTransport,
    private prefix: string,
  ) {}

  /** AUTH — Authenticate the connection */
  async auth(token: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${token}`, );
  }

  /** EVALUATE — Evaluate an authorization request against loaded policies */
  async evaluate(json: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${json}`, );
  }

  /** HEALTH — Check server health */
  async health(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/HEALTH`);
  }

  /** KEY_INFO — Get signing key information */
  async keyInfo(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/KEY_INFO`);
  }

  /** KEY_ROTATE — Rotate the signing key used for JWT decisions */
  async keyRotate(options?: {
    force?: string;
    dryrun?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/KEY_ROTATE`);
  }

  /** POLICY_INFO — Get information about a specific policy */
  async policyInfo(name: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${name}`, );
  }

  /** POLICY_LIST — List all loaded policies */
  async policyList(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/POLICY_LIST`);
  }

  /** POLICY_RELOAD — Reload policies from disk */
  async policyReload(): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/POLICY_RELOAD`);
  }

}

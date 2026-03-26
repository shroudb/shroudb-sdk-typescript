import { HttpTransport } from './transport';

export class PulseNamespace {
  constructor(
    private transport: HttpTransport,
    private prefix: string,
  ) {}

  /** ACTORS — Most active actors */
  async actors(options?: {
    window?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/ACTORS`);
  }

  /** AUTH — Authenticate the connection */
  async auth(token: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${token}`, );
  }

  /** COUNT — Count events matching filter arguments */
  async count(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/COUNT`);
  }

  /** ERRORS — Per-operation error rates */
  async errors(options?: {
    engine?: string;
    window?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/ERRORS`);
  }

  /** HEALTH — Check server health */
  async health(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/HEALTH`);
  }

  /** HOTSPOTS — Find hotspot resources with highest activity */
  async hotspots(options?: {
    engine?: string;
    window?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/HOTSPOTS`);
  }

  /** INGEST — Ingest a single audit event */
  async ingest(json: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${json}`, { verb: 'INGEST' });
  }

  /** INGEST_BATCH — Ingest a batch of audit events */
  async ingestBatch(json: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${json}`, { verb: 'INGEST_BATCH' });
  }

  /** QUERY — Query events with filter arguments */
  async query(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/QUERY`);
  }

  /** SOURCE_LIST — List configured event sources */
  async sourceList(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/SOURCE_LIST`);
  }

  /** SOURCE_STATUS — Show per-source ingestion statistics */
  async sourceStatus(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/SOURCE_STATUS`);
  }

}

import { HttpTransport } from './transport';

export class CourierNamespace {
  constructor(
    private transport: HttpTransport,
    private prefix: string,
  ) {}

  /** AUTH — Authenticate the connection */
  async auth(token: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${token}`, );
  }

  /** CHANNEL_INFO — Get subscriber count for a WebSocket channel */
  async channelInfo(channel: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${channel}`, );
  }

  /** CHANNEL_LIST — List all active WebSocket channels */
  async channelList(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/CHANNEL_LIST`);
  }

  /** CONNECTIONS — Get total WebSocket connections */
  async connections(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/CONNECTIONS`);
  }

  /** DELIVER — Deliver a notification (decrypts recipient, renders template, sends via adapter) */
  async deliver(json: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${json}`, { verb: 'DELIVER' });
  }

  /** HEALTH — Check server health */
  async health(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/HEALTH`);
  }

  /** TEMPLATE_INFO — Get information about a specific template */
  async templateInfo(name: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${name}`, );
  }

  /** TEMPLATE_LIST — List all loaded templates */
  async templateList(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/TEMPLATE_LIST`);
  }

  /** TEMPLATE_RELOAD — Reload templates from disk */
  async templateReload(): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/TEMPLATE_RELOAD`);
  }

}

import { HttpTransport } from './transport';

export class ControlNamespace {
  constructor(
    private transport: HttpTransport,
    private prefix: string,
  ) {}

  /** POST /v1/control/tenants — Create a new tenant */
  async createTenant(body: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/tenants`, body);
  }

  /** DELETE /v1/control/tenants/{id} — Deprovision a tenant (shuts down engines and removes data) */
  async deleteTenant(id: string): Promise<Record<string, unknown>> {
    return this.transport.delete(`${this.prefix}/tenants/${id}`);
  }

  /** GET /v1/control/tenants/{id} — Get tenant details */
  async getTenant(id: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/tenants/${id}`);
  }

  /** GET /v1/control/tenants — List all tenants */
  async listTenants(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/tenants`);
  }

  /** GET /v1/control/route/{tenant_id} — Returns which instance owns a tenant (for sharded mode routing) */
  async routeTenant(tenantId: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/route/${tenantId}`);
  }

}

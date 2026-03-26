import { HttpTransport } from './transport';
import { VaultNamespace } from './vault';
import { TransitNamespace } from './transit';
import { VeilNamespace } from './veil';
import { SentryNamespace } from './sentry';
import { MintNamespace } from './mint';
import { KeepNamespace } from './keep';
import { CourierNamespace } from './courier';
import { PulseNamespace } from './pulse';
import { ControlNamespace } from './control';

export interface ShrouDBOptions {
  /** Moat HTTP endpoint (e.g. "https://moat.example.com") */
  endpoint: string;
  /** Bearer token for authentication */
  token?: string;
}

export class ShrouDB {
  private transport: HttpTransport;
  public readonly vault: VaultNamespace;
  public readonly transit: TransitNamespace;
  public readonly veil: VeilNamespace;
  public readonly sentry: SentryNamespace;
  public readonly mint: MintNamespace;
  public readonly keep: KeepNamespace;
  public readonly courier: CourierNamespace;
  public readonly pulse: PulseNamespace;
  public readonly control: ControlNamespace;

  constructor(options: ShrouDBOptions) {
    this.transport = new HttpTransport(options.endpoint, options.token);
    this.vault = new VaultNamespace(this.transport, '/v1/vault');
    this.transit = new TransitNamespace(this.transport, '/v1/transit');
    this.veil = new VeilNamespace(this.transport, '/v1/veil');
    this.sentry = new SentryNamespace(this.transport, '/v1/sentry');
    this.mint = new MintNamespace(this.transport, '/v1/mint');
    this.keep = new KeepNamespace(this.transport, '/v1/keep');
    this.courier = new CourierNamespace(this.transport, '/v1/courier');
    this.pulse = new PulseNamespace(this.transport, '/v1/pulse');
    this.control = new ControlNamespace(this.transport, '/v1/control');
  }
}

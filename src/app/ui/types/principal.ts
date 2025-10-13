export interface Principal {
  name: string;
  clientId?: string;
  properties?: Record<string, string>;
  createTimestamp?: number;
  lastUpdateTimestamp?: number;
  entityVersion?: number;
}

export interface PrincipalCredentials {
  clientId: string;
  clientSecret: string;
}

export interface PrincipalWithCredentials {
  principal: Principal;
  credentials: PrincipalCredentials;
}


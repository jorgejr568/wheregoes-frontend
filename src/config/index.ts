export interface Config {
  GetHost(): string;
  GetWsProtocol(): string;
  GetHttpProtocol(): string;
}

class ConfigImpl implements Config {
  GetHost(): string {
    return import.meta.env.VITE_APP_API_HOST;
  }
  GetWsProtocol(): string {
    return import.meta.env.VITE_APP_API_WS_PROTOCOL;
  }
  GetHttpProtocol(): string {
    return import.meta.env.VITE_APP_API_HTTP_PROTOCOL;
  }
}

export const config: Config = new ConfigImpl();

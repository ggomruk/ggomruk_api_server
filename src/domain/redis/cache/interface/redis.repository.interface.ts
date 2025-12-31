export interface RedisRepositoryInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  publish(channel: string, message: string): Promise<number>;
  subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void>;
}

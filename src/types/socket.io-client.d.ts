declare module "socket.io-client" {
  export interface Socket {
    id?: string;
    connected: boolean;
    on(event: string, callback: (...args: any[]) => void): this;
    off(event: string, callback?: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): this;
    disconnect(): this;
    connect(): this;
  }

  export interface ManagerOptions {
    path?: string;
    transports?: string[];
    withCredentials?: boolean;
    autoConnect?: boolean;
    reconnection?: boolean;
    [key: string]: any;
  }

  export function io(uri?: string, opts?: ManagerOptions): Socket;
  export const connect: typeof io;
  export default io;
}


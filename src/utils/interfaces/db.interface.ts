import { ConnectOptions } from "mongoose";

interface ConnectOptionsWithDefaults extends ConnectOptions {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
}

export interface DatabaseConfig {
    mongoUri?: string;
    port?: number;
    host?: string;
    name?: string;
    opts?: ConnectOptionsWithDefaults;
}


export interface DbInterface {
    connect(...args: [DatabaseConfig]): Promise<void>;
    disconnect(): Promise<void>
}
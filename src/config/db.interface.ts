import mongoose from 'mongoose';
import { DatabaseConfig } from '@/utils/interfaces/db.interface';

class Database {
    private mongoose = mongoose;

    public async connect({
        mongoUri = "",
        port,
        host,
        name,
        opts = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
    }: DatabaseConfig): Promise<void> {
        try {
            console.log("Connecting to database");
            if (mongoUri) {
                await this.mongoose.connect(mongoUri, opts);
            } else {
                await this.mongoose.connect(
                    `mongodb://${host}:${port}/${name}?readPreference=primary&appname=pp_server&ssl=false`,
                    opts
                );
            }
            console.log("Connected to database");
            return Promise.resolve();
        } catch (error) {
            console.info("Failed to connect with database");
            console.log(error);
            throw new Error("Failed to connect to database");
        }
    }

    public async disconnect(): Promise<void> {
        console.info("Disconnecting from database");
        await this.mongoose.disconnect();
    }
}

const database = new Database();
export default database;

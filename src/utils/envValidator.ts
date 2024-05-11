const { cleanEnv, str, port } = require('envalid');

export function envValidator() {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['development', 'production', 'test'],
            default: 'development'
        }),
        MONGO_URI: str(),
        PORT: port({ default: 3000 }),
        JWT_SECRET: str(),
        AWS_ACCESS_KEY_ID: str(),
        AWS_SECRET_ACCESS_KEY: str(),
        AWS_REGION: str(),
        AWS_BUCKET: str(),
    });
}
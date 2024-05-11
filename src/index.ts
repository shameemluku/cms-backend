import 'dotenv/config';
import 'module-alias/register';
import App from './app';
import DbInterface from './config/db.interface';
import UserRouter from './resources/user/user.router';
import FormRouter from './resources/form/form.router';
import { envValidator } from './utils/envValidator';

envValidator();

const app = new App(
    [
        new UserRouter(),
        new FormRouter()
    ],
    DbInterface,
    Number(process.env.PORT)
);

app.listen();
# CMS Backend

This is the backend application for a Content Management System (CMS) built using TypeScript, utilizing AWS S3 for file storage and MongoDB for data storage.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shameemluku/cms-backend.git
   ```

2. Navigate to the project directory:

   ```bash
   cd cms-backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:

   Create a `.env` file in the root directory and populate it with the following environment variables:

   ```plaintext
   MONGO_URI= <Your MongoDB URI>
   AWS_ACCESS_KEY_ID= <Your AWS Access Key ID>
   AWS_SECRET_ACCESS_KEY= <Your AWS Secret Access Key>
   JWT_SECRET= <Your JWT Secret>
   AWS_BUCKET= <Your AWS S3 Bucket Name>
   AWS_REGION= <Your AWS Region>
   PORT= <Port Number>
   ```

## Usage

To start the server in development mode:

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

## Scripts

- `dev`: Starts the server in development mode using `ts-node-dev`.
- `start`: Builds the project and starts the server in production mode.
- `build`: Builds the project.

## Dependencies

- **@elastic/elasticsearch**: ^8.9.0
- **@types/bcrypt**: ^5.0.2
- **@types/cookie-parser**: ^1.4.7
- **@types/jsonwebtoken**: ^9.0.6
- **aws-sdk**: ^2.1618.0
- **bcrypt**: ^5.1.1
- **celebrate**: ^15.0.3
- **compression**: ^1.7.4
- **cookie-parser**: ^1.4.6
- **cors**: ^2.8.5
- **dotenv**: ^16.3.1
- **envalid**: ^7.3.1
- **express**: ^4.18.2
- **helmet**: ^7.0.0
- **http-status**: ^1.7.4
- **jsonwebtoken**: ^9.0.2
- **mongodb**: ^5.7.0
- **mongoose**: ^7.4.1
- **morgan**: ^1.10.0

## Dev Dependencies

- **@types/compression**: ^1.7.2
- **@types/cors**: ^2.8.13
- **@types/express**: ^4.17.17
- **@types/jest**: ^29.5.3
- **@types/morgan**: ^1.9.4
- **@types/node**: ^20.4.6
- **@types/supertest**: ^2.0.12
- **jest**: ^29.6.2
- **mongodb-memory-server**: ^8.14.0
- **supertest**: ^6.3.3
- **ts-jest**: ^29.1.1
- **ts-node-dev**: ^2.0.0
- **tsc-watch**: ^6.0.4
- **typescript**: ^5.1.6


Enjoyyyy...
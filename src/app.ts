import express, { Application } from "express";
import { DbInterface } from "@/utils/interfaces/db.interface";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import Controller from "@/utils/interfaces/controller.interface";
import handleNotFound from "@/utils/exceptions/handleNotFound";
import errorConverter from "@/middlewares/error.converter.middleware";
import errorMiddleware from "@/middlewares/error.middleware";
import cookieParser from "cookie-parser";

class App {
  public express: Application;

  constructor(
    controllers: Controller[],
    private dbInterface: DbInterface | null,
    // private elasticSearchService: ElasticsearchService,
    private port: number,
    type?: string
  ) {
    this.express = express();

    if (dbInterface !== null && type !== "test") {
      // for test
      this.initiliaseDatabaseConnection();
    }
    this.initiliaseMiddlewares();
    this.initialiseControllers(controllers);
    this.handleNotFoundRequest();
    this.initiliaseErrorHandling();
  }

  public listen(): void {
    this.express.listen(this.port, () => {
      console.log(`App listening on port: ${this.port}`);
    });
  }

  private async initiliaseDatabaseConnection(): Promise<void> {
    const { MONGO_URI } = process.env;
    this.dbInterface = this.dbInterface as DbInterface;
    await this.dbInterface.connect({ mongoUri: MONGO_URI });
    // this.initiliaseElasticSearch();
  }

  // private async initiliaseElasticSearch(): Promise<void> {
  //     await this.elasticSearchService.checkClusterHealth();
  //     await this.elasticSearchService.createIndices();
  //     await new MongoDBElasticsearchSync([
  //         [bookModel, bookElasticSearchFields]
  //     ], this.elasticSearchService).setupChangeStreams()
  // }

  private initiliaseMiddlewares(): void {
    this.express.use(cors({ origin: true, credentials: true }));
    this.express.use(helmet());
    this.express.use(morgan("dev"));
    this.express.use(express.json({ limit: "200mb" }));
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(cookieParser());
    this.express.use(compression());
  }

  private initialiseControllers(controllers: Controller[]): void {
    controllers.forEach((controller: Controller) => {
      this.express.use("/api", controller.router);
    });
  }

  private handleNotFoundRequest(): void {
    this.express.use(handleNotFound);
  }

  private initiliaseErrorHandling(): void {
    this.express.use(errorConverter);
    this.express.use(errorMiddleware);
  }
}

export default App;

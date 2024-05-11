import Controller from "@/utils/interfaces/controller.interface";
import { Router } from "express";
import UserController from "./user.controller";
import UserService from "./user.service";
import FormService from "../form/form.service";

class UserRouter implements Controller {
  constructor(
    public router = Router(),
    private userController = new UserController(
      new UserService(),
      new FormService()
    ),
    public path = "/user"
  ) {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    this.router.use(this.path, this.userController.router);
  }
}

export default UserRouter;

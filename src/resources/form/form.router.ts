import Controller from "@/utils/interfaces/controller.interface";
import { Router } from "express";
import FormController from "./form.controller";
import FormService from "./form.service";
import UserService from "../user/user.service";

class FormRouter implements Controller {
  constructor(
    public router = Router(),
    private formController = new FormController(
      new FormService(),
      new UserService()
    ),
    public path = "/form"
  ) {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    this.router.use(this.path, this.formController.router);
  }
}

export default FormRouter;

import HttpException from "@/utils/exceptions/http.exception";
import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import httpStatus from "http-status";
import FormService from "./form.service";
import validator from "./from.validation";
import authMiddleware from "@/middlewares/auth.middleware";
import UserService from "../user/user.service";

class FormController implements Controller {
  constructor(
    private formService: FormService,
    private userService: UserService,
    public router = Router()
  ) {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    let controllers = this.getControllerInstance();
    this.router.use(authMiddleware);
    this.router.post(
      `/create-form`,
      validator.validateFormData,
      controllers.createForm
    );

    this.router.post(
      `/create-field-config`,
      validator.validateFieldData,
      controllers.createFieldConfig
    );

    this.router.get(`/get-config`, controllers.getFormConfig);
    this.router.get(
      `/get-fields`,
      validator.validateParentId,
      controllers.getFormFields
    );
  }

  private getControllerInstance() {
    const { formService, userService } = this;
    return {
      async createForm(req: Request, res: Response, next: NextFunction) {
        try {
          const { form_data } = req.body;
          await formService.deActivateForms();
          await formService.createForm({
            steps: form_data,
            is_active: true,
          });
          res.json({
            status: true,
            message: "Form created successfully!",
          });
        } catch (error) {
          console.log(error);
          return next(
            new HttpException(
              httpStatus.INTERNAL_SERVER_ERROR,
              "Internal Server Error"
            )
          );
        }
      },

      async createFieldConfig(req: Request, res: Response, next: NextFunction) {
        try {
          const data = req.body;
          await formService.deActivateFields(data?.parent_id);
          await formService.createFieldConfig({
            ...data,
            is_active: true,
          });
          res.json({
            status: true,
            message: "Field created successfully!",
          });
        } catch (error) {
          console.log(error);
          return next(
            new HttpException(
              httpStatus.INTERNAL_SERVER_ERROR,
              "Internal Server Error"
            )
          );
        }
      },

      async getFormConfig(req: Request, res: Response, next: NextFunction) {
        try {
          const user = await userService.getUserById(req.decodedToken?.userId);
          const { flow_id, config_ids } = user?.config;
          const data = await formService.getLatestConfig(flow_id, config_ids);

          res.json({
            status: true,
            message: "Config fetched!",
            data,
          });
        } catch (error) {
          console.log(error);
          return next(
            new HttpException(
              httpStatus.INTERNAL_SERVER_ERROR,
              "Internal Server Error"
            )
          );
        }
      },

      async getFormFields(req: Request, res: Response, next: NextFunction) {
        try {
          const { parent_id } = req.query;
          if (typeof parent_id === "string") {
            const data = await formService.getActiveFieldsById(parent_id);
            res.json({
              status: true,
              message: "Fields fetched!",
              data,
            });
          } else {
            throw new Error("Invalid parent_id type");
          }
        } catch (error) {
          console.log(error);
          return next(
            new HttpException(
              httpStatus.INTERNAL_SERVER_ERROR,
              "Internal Server Error"
            )
          );
        }
      },
    };
  }
}

export default FormController;

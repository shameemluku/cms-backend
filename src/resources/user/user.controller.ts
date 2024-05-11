import HttpException from "@/utils/exceptions/http.exception";
import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import httpStatus from "http-status";
import UserService from "./user.service";
import validator from "./user.validation";
import BcryptUtils from "@/utils/bcryptUtils";
import JwtUtils from "@/utils/jwtUtils";
import { CONSTANTS } from "./../../constants";
import authMiddleware from "@/middlewares/auth.middleware";
import FormService from "../form/form.service";
import { FieldDocument } from "../form/models/field.model";
import S3Service from "@/services/s3.service";

class UserController implements Controller {
  constructor(
    private UserService: UserService,
    private formService: FormService,
    public router = Router()
  ) {
    this.initialiseRoutes();
  }

  private s3Service = S3Service.getInstance();

  private initialiseRoutes(): void {
    let ctrl = this.getControllerInstance();
    this.router.post(
      `/create`,
      validator.createUserValidation,
      ctrl.createUser
    );
    this.router.post(`/login`, validator.LoginUserValidation, ctrl.loginUser);
    this.router.get(`/verify`, ctrl.verifyUserToken);

    this.router.use(authMiddleware);

    this.router.patch(
      `/update-user-details`,
      validator.userDetailsValidation,
      ctrl.updateUserDetails
    );
  }

  private getControllerInstance() {
    const { UserService, formService, s3Service } = this;

    return {
      async createUser(req: Request, res: Response, next: NextFunction) {
        try {
          const { email, password } = req.body;
          let existingUser = await UserService.getUserByQuery({ email });
          if (existingUser) {
            return next(
              new HttpException(httpStatus.BAD_REQUEST, "User Already exist")
            );
          }

          const hashedPassword = await BcryptUtils.hashPassword(password);
          const configData = await formService.getLatestConfig();
          const { form_flow, form_fields } = configData;

          let user: any = await UserService.createUser({
            email,
            password: hashedPassword,
            role: CONSTANTS.USER_ROLES.ADMIN,
            config: {
              flow_id: form_flow?.flow_id || null,
              config_ids: form_fields?.map((item: FieldDocument) => {
                return item?.config_id;
              }),
            },
          });
          delete user.password;
          const token = JwtUtils.signToken({ userId: user._id }, "1h");
          res.cookie("token", token, {
            httpOnly: true,
            // secure: true, // Uncomment this line if you're using HTTPS
            maxAge: 3600000, // 1 hour expiration
          });
          return res.json({
            status: true,
            data: user,
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

      // @desc Login user
      async loginUser(req: Request, res: Response, next: NextFunction) {
        try {
          const { email, password } = req.body;
          const user = await UserService.getUserByQuery({ email });
          if (!user) {
            return next(
              new HttpException(httpStatus.UNAUTHORIZED, "User not found")
            );
          }
          const isMatch = await BcryptUtils.comparePasswords(
            password,
            user.password
          );
          if (!isMatch) {
            return next(
              new HttpException(
                httpStatus.UNAUTHORIZED,
                "Invalid email or password"
              )
            );
          }
          delete user.password;
          const token = JwtUtils.signToken({ userId: user._id }, "1h");
          res.cookie("token", token, {
            secure: process.env.ENVIRONMENT !== "local",
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "none",
            path: "/",
            httpOnly: process.env.ENVIRONMENT !== "local" ? true : false,
          });
          return res.json({
            status: true,
            data: user,
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

      async verifyUserToken(req: Request, res: Response, next: NextFunction) {
        try {
          const token = req.cookies?.token;
          if (!token) {
            return next(
              new HttpException(httpStatus.UNAUTHORIZED, "Token not provided")
            );
          }
          const decoded = JwtUtils.verifyToken(token);
          if (!decoded) {
            return next(
              new HttpException(
                httpStatus.UNAUTHORIZED,
                "Invalid or expired token"
              )
            );
          }

          const user = await UserService.getUserById(decoded.userId);
          if (!user) {
            return next(
              new HttpException(httpStatus.UNAUTHORIZED, "User not found")
            );
          }
          delete user?.password;
          return res.json({
            status: true,
            message: "Token is valid",
            userId: decoded.userId,
            user,
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

      async updateUserDetails(req: Request, res: Response, next: NextFunction) {
        try {
          const { id_proof_upload, job_verification_doc, user_id } = req.body;

          await Promise.all([
            s3Service.uploadBase64Image(
              id_proof_upload,
              process.env.AWS_BUCKET || "",
              `id_proof_upload_${user_id}`
            ),
            s3Service.uploadBase64Image(
              job_verification_doc,
              process.env.AWS_BUCKET || "",
              `job_verification_doc_${user_id}`
            ),
          ]);

          // Update user details with the S3 URLs
          const userDetails = await UserService.updateUserDetails({
            ...req.body,
            id_proof_upload: `id_proof_upload_${user_id}`,
            job_verification_doc: `job_verification_doc_${user_id}`,
          });

          return res.json({
            status: true,
            message: "User details updated!",
            data: userDetails,
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
    };
  }
}

export default UserController;

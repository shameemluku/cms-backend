import HttpException from "@/utils/exceptions/http.exception";
import Controller from "@/utils/interfaces/controller.interface";
import { NextFunction, Request, Response, Router } from "express";
import httpStatus from "http-status";
import UserService from "./user.service";
import validator from "./user.validation";
import BcryptUtils from "@/utils/bcryptUtils";
import JwtUtils from "@/utils/jwtUtils";
import { CONSTANTS } from "./../../constants";
import authMiddleware, {
  authAdminMiddleware,
} from "@/middlewares/auth.middleware";
import FormService from "../form/form.service";
import { FieldDocument } from "../form/models/field.model";
import S3Service from "@/services/s3.service";
import { getExtentionFromBase64 } from "@/utils/others";

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
    this.router.get(`/logout`, ctrl.logoutUser);

    this.router.use(authMiddleware);

    this.router.patch(
      `/update-user-details`,
      validator.userDetailsValidation,
      ctrl.updateUserDetails
    );

    this.router.get(
      `/get-user-details`,
      validator.validateUserId,
      ctrl.getUserDetails
    );

    // Following Routes are accessbile for admin
    this.router.use(authAdminMiddleware);

    this.router.get(`/get-all-users`, ctrl.getAllUserDetails);
    this.router.get(`/get-user-doc`, validator.validateDocKey, ctrl.getUserDoc);
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
            role: CONSTANTS.USER_ROLES.END_USER,
            config: {
              flow_id: form_flow?.flow_id || null,
              config_ids: form_fields?.map((item: FieldDocument) => {
                return item?.config_id;
              }),
            },
          });
          delete user.password;
          const token = JwtUtils.signToken(
            { userId: user._id, role: user.role },
            "3h"
          );
          res.cookie("token", token, {
            httpOnly: true,
            // secure: true, // Uncomment this line if you're using HTTPS
            maxAge: 3600000, // 3 hour expiration
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
          const token = JwtUtils.signToken(
            { userId: user._id, role: user.role },
            "3h"
          );
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

      async logoutUser(req: Request, res: Response, next: NextFunction) {
        try {
          res.clearCookie("token");
          return res.json({
            status: true,
            message: "Logged out successfully",
          });
        } catch (error) {
          console.error(error);
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

          let key_id = `id_proof_upload_${user_id}.${getExtentionFromBase64(
            id_proof_upload
          )}`;

          let key_job = `job_verification_doc_${user_id}.${getExtentionFromBase64(
            id_proof_upload
          )}`;

          await Promise.all([
            s3Service.uploadBase64Image(
              id_proof_upload,
              process.env.AWS_BUCKET || "",
              key_id
            ),
            s3Service.uploadBase64Image(
              job_verification_doc,
              process.env.AWS_BUCKET || "",
              key_job
            ),
          ]);

          // Update user details with the S3 URLs
          const userDetails = await UserService.updateUserDetails({
            ...req.body,
            id_proof_upload: key_id,
            job_verification_doc: key_job,
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

      async getUserDetails(req: Request, res: Response, next: NextFunction) {
        try {
          const { user_id } = req.query;
          if (typeof user_id !== "string") {
            return next(
              new HttpException(httpStatus.BAD_GATEWAY, "Invalid user_id")
            );
          }
          const userDetails = await UserService.getUserDetailsById(user_id);
          return res.json({
            status: true,
            message: "User details fetched!",
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

      async getAllUserDetails(req: Request, res: Response, next: NextFunction) {
        try {
          const users = await UserService.getAllUsers();
          return res.json({
            status: true,
            message: "User details fetched!",
            data: users,
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

      async getUserDoc(req: Request, res: Response, next: NextFunction) {
        try {
          const { key } = req.query;
          if (typeof key !== "string") {
            return next(
              new HttpException(httpStatus.BAD_GATEWAY, "Invalid key type")
            );
          }

          let response = await s3Service.getS3File(
            key,
            process.env.AWS_BUCKET || ""
          );

          res.setHeader("Content-Disposition", `attachment; filename=${key}`);
          res.setHeader("Content-Type", response?.ContentType);
          return res.send(
            Buffer.from(response.Body.toString("base64"), "base64")
          );
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

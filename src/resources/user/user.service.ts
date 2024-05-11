import DBService from "@/services/db.service";
import { IUserDetails, User } from "./user.interface";
import UserModel from "@/resources/user/model/user.model"; // Import your User model
import mongoose from "mongoose";
import UserDetailsModel from "./model/userDetails.model";

class UserService {
  private db = new DBService("users");
  private dbDetails = new DBService("user-details");

  public async createUser(user: User): Promise<User> {
    return await UserModel.create(user);
  }

  public async getUserByQuery(query: any): Promise<any> {
    return await this.db.getOneByQuery(query, { noErr: true });
  }

  public async getUserById(id: string): Promise<any> {
    const objectId = new mongoose.Types.ObjectId(id);
    return await this.db.getById(objectId, { noErr: true });
  }

  public async updateUserDetails(
    userData: IUserDetails
  ): Promise<IUserDetails> {
    const existingPerson = await UserDetailsModel.findOne({
      user_id: userData?.user_id,
    });

    if (existingPerson) {
      existingPerson.set(userData);
      return await existingPerson.save();
    } else {
      const newData = new UserDetailsModel(userData);
      return await newData.save();
    }
  }

  public async getUserDetailsById(id: string): Promise<any> {
    const objectId = new mongoose.Types.ObjectId(id);
    return await this.dbDetails.getById(objectId, { noErr: true });
  }
}

export default UserService;

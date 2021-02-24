import { EntityRepository, Repository } from "typeorm";
import User from "../models/User";

@EntityRepository(User)
export default class UsersRepository extends Repository<User> {
  
}
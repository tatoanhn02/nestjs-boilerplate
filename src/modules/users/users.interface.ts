import { RoleDocument } from '../roles/roles.schema';
import { UserDocument } from './users.schema';

export class UserProfile {
  _id: UserDocument['_id'];
  email: UserDocument['email'];
  firstName: UserDocument['firstName'];
  lastName: UserDocument['lastName'];
  role: RoleDocument['name'];
  status: UserDocument['status'];
  provider: UserDocument['provider'];
}

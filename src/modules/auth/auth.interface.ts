import { UserDocument } from '../users/users.schema';

export interface ILoginRequest extends Request {
  user: UserDocument;
}

import { UserResponseDto } from '@/users/dto/user-response.dto';

export interface RequestWithUser extends Request {
  user: UserResponseDto;
}

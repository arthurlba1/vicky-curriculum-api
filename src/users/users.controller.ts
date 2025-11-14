import { Controller, Get, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { STATUS_CODES } from '@/common/types/status';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { ApiDeleteUserByIdDocumentation, ApiGetAllUsersDocumentation, ApiGetUserByIdDocumentation } from '@/users/decorators/user-swagger.decorator';
import { FindAllUsersUseCase } from '@/users/use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from '@/users/use-cases/find-user-by-id.use-case';
import { RemoveUserUseCase } from '@/users/use-cases/remove-user.use-case';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
  ) {}

  @Get()
  @ApiGetAllUsersDocumentation()
  async findAll(): Promise<ApiResponseDto<UserResponseDto[]>> {
    const users = await this.findAllUsersUseCase.execute();

    return {
      data: UserResponseDto.fromEntities(users),
      message: 'Users retrieved successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Get(':id')
  @ApiGetUserByIdDocumentation()
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.findUserByIdUseCase.execute(id);

    return {
      data: UserResponseDto.fromEntity(user),
      message: 'User retrieved successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Delete(':id')
  @ApiDeleteUserByIdDocumentation()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<void>> {
    await this.removeUserUseCase.execute(id);
    return {
      message: 'User deleted successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }
}

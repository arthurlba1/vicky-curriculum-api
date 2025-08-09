import { Controller, Get, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ApiResponseDto } from '@/common/dto/api-response.dto';
import { UsersService } from '@/users/users.service';
import { UserResponseDto } from '@/users/dto/user-response.dto';
import { ApiDeleteUserByIdDocumentation, ApiGetAllUsersDocumentation, ApiGetUserByIdDocumentation } from '@/users/decorators/user-swagger.decorator';
import { STATUS_CODES } from '@/common/types/status';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiGetAllUsersDocumentation()
  async findAll(): Promise<ApiResponseDto<UserResponseDto[]>> {
    return {
      data: await this.usersService.findAll(),
      message: 'Users retrieved successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Get(':id')
  @ApiGetUserByIdDocumentation()
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<UserResponseDto>> {
    return {
      data: await this.usersService.findOne(id),
      message: 'User retrieved successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }

  @Delete(':id')
  @ApiDeleteUserByIdDocumentation()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<void>> {
    await this.usersService.remove(id);
    return {
      message: 'User deleted successfully',
      statusCode: STATUS_CODES.SUCCESSFUL.OK,
    };
  }
}

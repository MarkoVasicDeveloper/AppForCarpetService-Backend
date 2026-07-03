import { Body, Controller, Delete, Get, Param, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { AdministratorService } from 'src/modules/administrator/administrator.service';
import { AddAdministratorDto } from 'src/modules/administrator/dto/add-administrator.dto';
import { DeleteAdministratorDto } from 'src/modules/administrator/dto/delete-administrator.dto';
import { EditAdministratorDto } from 'src/modules/administrator/dto/edit-administrator.dto';
import { UserService } from 'src/modules/user/user.service';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';
import { ApiResponse } from 'src/shared/response/api-response';

import { Administrator } from './administrator.entity';

@Controller('api/administrator')
export class AdministratorController {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly userService: UserService,
  ) {}

  @Post('add')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RoleCheckerGuard)
  async addAdministrator(@Body() data: AddAdministratorDto): Promise<Administrator | ApiResponse> {
    return await this.administratorService.addAdministrator(data);
  }

  @Post('edit')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RoleCheckerGuard)
  async editAdmin(@Body() data: EditAdministratorDto): Promise<Administrator | ApiResponse> {
    return await this.administratorService.editAdmin(data);
  }

  @Delete('delete')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RoleCheckerGuard)
  async deleteAdmin(@Body() data: DeleteAdministratorDto): Promise<Administrator | ApiResponse> {
    return await this.administratorService.deleteAdmin(data);
  }

  @Get('allAdmin')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RoleCheckerGuard)
  async getAllAdmin(): Promise<Administrator[]> {
    return await this.administratorService.getAllAdmin();
  }

  @Post('getAdminByUsername')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RoleCheckerGuard)
  async getAdminByUsername(
    @Body() data: { username: string },
  ): Promise<Administrator | ApiResponse | undefined> {
    return await this.administratorService.getAdminByUsername(data);
  }

  @Post('user/invalideRefreshTokens/:id')
  @SetMetadata('allow_to_roles', ['administrator'])
  @UseGuards(RoleCheckerGuard)
  async invalideRefreshToken(@Param('id') userId: number): Promise<ApiResponse> {
    const tokenPromises = await this.userService.invalidateUserTokens(userId);

    await Promise.all(tokenPromises);

    return new ApiResponse(true, 0, 'All refresh tokens for this user have been invalidated.');
  }
}

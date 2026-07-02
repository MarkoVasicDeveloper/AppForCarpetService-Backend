import { Body, Controller, Get, Param, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminTokenDto } from 'src/modules/auth/dto/admin-token.dto';
import { UserAuthDto } from 'src/modules/user/dto/user-auth.dto';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { AuthService } from './auth.service';
import { UserTokenDto } from './dto/user-token.dto';
import { UsernameAdministratorDto } from './dto/username-administrator.dto';
import { RefreshToken } from './entities/refresh-token.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('administrator')
  async doLogin(@Body() data: UsernameAdministratorDto, @Req() req: Request) {
    return await this.authService.loginAdministrator(data, req.ip ?? '', req.headers['user-agent']);
  }

  @Post('user')
  async doLoginUser(@Body() data: UserAuthDto, @Req() req: Request) {
    return await this.authService.loginUser(data, req.ip ?? '', req.headers['user-agent']);
  }

  @Post('user/refresh')
  async userTokenRefresh(@Req() req: Request, @Body() data: UserTokenDto) {
    return await this.authService.refreshUserToken(
      data.token,
      req.ip ?? '',
      req.headers['user-agent'],
    );
  }

  @Post('administrator/refresh')
  async adminTokenRefresh(@Req() req: Request, @Body() data: AdminTokenDto) {
    return await this.authService.refreshAdminToken(
      data.token,
      req.ip ?? '',
      req.headers['user-agent'],
    );
  }

  @Get('tokens/invalidate/:userId')
  @UseGuards(RoleCheckerGuard)
  @SetMetadata('allow_to_roles', ['administrator'])
  async invalidAllUserToken(@Param('userId') userId: number): Promise<RefreshToken[]> {
    return await this.authService.invalidAllUserTokens(userId);
  }
}

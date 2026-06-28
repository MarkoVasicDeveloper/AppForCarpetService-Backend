import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AdminTokenDto } from 'src/modules/administrator/DTO/admin.token.dto';
import { UsernameAdministratorDto } from 'src/modules/administrator/DTO/username.administrator.dto';
import { UserTokenDto } from 'src/modules/token/DTO/user.token.dto';
import { UserAuthDto } from 'src/modules/user/DTO/user.auth.dto';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('administrator')
  async doLogin(@Body() data: UsernameAdministratorDto, @Req() req: Request) {
    return await this.authService.loginAdministrator(data, req.ip, req.headers['user-agent']);
  }

  @Post('user')
  async doLoginUser(@Body() data: UserAuthDto, @Req() req: Request) {
    return await this.authService.loginUser(data, req.ip, req.headers['user-agent']);
  }

  @Post('user/refresh')
  async userTokenRefresh(@Req() req: Request, @Body() data: UserTokenDto) {
    return await this.authService.refreshUserToken(data.token, req.ip, req.headers['user-agent']);
  }

  @Post('administrator/refresh')
  async adminTokenRefresh(@Req() req: Request, @Body() data: AdminTokenDto) {
    return await this.authService.refreshAdminToken(data.token, req.ip, req.headers['user-agent']);
  }
}

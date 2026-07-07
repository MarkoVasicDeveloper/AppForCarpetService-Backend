import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/shared/decorators/public.decorator';
import {
  ExtractRequestMetaData,
  RequestMetaData,
} from 'src/shared/decorators/request-metadata.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginDto, @ExtractRequestMetaData() meta: RequestMetaData) {
    return await this.authService.login(data, meta.ipAddress, meta.userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() data: RefreshTokenDto, @ExtractRequestMetaData() meta: RequestMetaData) {
    return await this.authService.refresh(data.token, meta.ipAddress, meta.userAgent);
  }

  @Delete('users/:userId/tokens')
  @UseGuards(RoleCheckerGuard)
  @Roles(Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.OK)
  async invalidateAllUserTokens(@Param('userId', ParseIntPipe) userId: number): Promise<void> {
    return await this.authService.invalidateAllUserTokens(userId);
  }
}

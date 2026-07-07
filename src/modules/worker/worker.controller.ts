import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { AddWorkerDto } from 'src/modules/worker/dto/add-worker.dto';
import { EditWorkerDto } from 'src/modules/worker/dto/edit-worker.dto';
import { Worker } from 'src/modules/worker/worker.entity';
import { WorkerService } from 'src/modules/worker/worker.service';
import { CurrentOwnerId } from 'src/shared/decorators/current-owner-id.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { RoleCheckerGuard } from 'src/shared/guards/role-checker.guard';

@Controller('workers')
@UseGuards(RoleCheckerGuard)
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  @Roles(Role.USER, Role.ADMINISTRATOR)
  async addWorker(@Body() data: AddWorkerDto, @CurrentOwnerId() ownerId: number): Promise<Worker> {
    return await this.workerService.addWorker(data, ownerId);
  }

  @Put(':id')
  @Roles(Role.USER, Role.ADMINISTRATOR, Role.WORKER)
  async editWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: EditWorkerDto,
    @CurrentOwnerId() ownerId: number,
  ): Promise<Worker> {
    return await this.workerService.editWorker(id, data, ownerId);
  }

  @Public()
  @Get('search/:userId')
  async findWorker(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('name') name: string,
    @Query('password') password: string,
  ): Promise<Worker> {
    return await this.workerService.findWorker(name, password, userId);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMINISTRATOR, Role.WORKER)
  async findWorkerById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwnerId() ownerId: number,
  ): Promise<Worker> {
    return await this.workerService.findWorkerById(id, ownerId);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.ADMINISTRATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWorker(
    @Param('id', ParseIntPipe) id: number,
    @CurrentOwnerId() ownerId: number,
  ): Promise<void> {
    await this.workerService.deleteWorker(id, ownerId);
  }
}

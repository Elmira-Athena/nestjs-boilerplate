import { Task } from '@database/typeorm/entities/task.entity';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';

const IdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('TASK-ID'),
});

@Controller('v1/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['task'],
    operationId: 'createTask',
    summary: 'Create task',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: Task })
  create(@Body() data: CreateTaskDto): Promise<Task> {
    return this.taskService.create(data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['task'],
    operationId: 'getTasks',
    summary: 'Get tasks',
  })
  @ApiResponse({ status: HttpStatus.OK, type: [Task] })
  findMany(@Query() filter: FilterTaskDto): Promise<Task[]> {
    return this.taskService.findAll(filter);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['task'],
    operationId: 'getTask',
    summary: 'Get task by ID',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Task })
  findOne(@Param('id', IdPipe) id: string): Promise<Task> {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['task'],
    operationId: 'updateTask',
    summary: 'Update task',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Task })
  update(
    @Param('id', IdPipe) id: string,
    @Body() data: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    tags: ['task'],
    operationId: 'deleteTask',
    summary: 'Delete task',
  })
  remove(@Param('id', IdPipe) id: string): Promise<void> {
    return this.taskService.remove(id);
  }
}

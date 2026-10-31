import { Task } from '@database/typeorm/entities/task.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  findAll(filter: FilterTaskDto): Promise<Task[]> {
    // undefined filter fields are ignored by TypeORM
    return this.taskRepository.find({
      where: filter,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) throw new NotFoundException('TASK-0001');
    return task;
  }

  create(data: CreateTaskDto): Promise<Task> {
    return this.taskRepository.save(this.taskRepository.create(data));
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    return this.taskRepository.save(Object.assign(task, data));
  }

  async remove(id: string): Promise<void> {
    const { affected } = await this.taskRepository.delete(id);
    if (!affected) throw new NotFoundException('TASK-0001');
  }
}

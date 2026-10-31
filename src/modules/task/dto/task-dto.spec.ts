import { ValidationPipe } from '@nestjs/common';
import { CreateTaskDto } from './create-task.dto';
import { FilterTaskDto } from './filter-task.dto';

// Same options as main.ts
const pipe = new ValidationPipe({
  whitelist: true,
  stopAtFirstError: true,
  transform: true,
});

const run = (value: object, metatype: any, type: 'body' | 'query' = 'body') =>
  pipe.transform(value, { type, metatype });

describe('Task DTOs', () => {
  it('parses isCompleted query string into boolean', async () => {
    expect(
      await run({ isCompleted: 'false' }, FilterTaskDto, 'query'),
    ).toMatchObject({ isCompleted: false });
    expect(
      await run({ isCompleted: 'true' }, FilterTaskDto, 'query'),
    ).toMatchObject({ isCompleted: true });
    await expect(
      run({ isCompleted: 'yes' }, FilterTaskDto, 'query'),
    ).rejects.toThrow();
  });

  it('rejects missing, empty or too long title', async () => {
    await expect(run({ category: 'Backend' }, CreateTaskDto)).rejects.toThrow();
    await expect(
      run({ title: '', category: 'Backend' }, CreateTaskDto),
    ).rejects.toThrow();
    await expect(
      run({ title: 'a'.repeat(256), category: 'Backend' }, CreateTaskDto),
    ).rejects.toThrow();
  });

  it('strips isCompleted on create', async () => {
    const dto = await run(
      { title: 'Học NestJS', category: 'Backend', isCompleted: true },
      CreateTaskDto,
    );
    expect(dto).not.toHaveProperty('isCompleted');
  });
});

import { PageOptionsDto } from '@core/pagination/dto/page-option.dto';
import { PageDto } from '@core/pagination/dto/page.dto';
import { Post as PostEntity } from '@database/typeorm/entities/post.entity';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

const IdPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('POST-ID'),
});

@Controller('v1/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['post'],
    operationId: 'getPosts',
    summary: 'Get posts',
  })
  @ApiResponse({ status: HttpStatus.OK, type: PageDto })
  findMany(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<PostEntity>> {
    return this.postService.findAll(pageOptionsDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    tags: ['post'],
    operationId: 'createPost',
    summary: 'Create post',
  })
  create(@Body() data: CreatePostDto): Promise<PostEntity> {
    return this.postService.create(data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['post'],
    operationId: 'updatePost',
    summary: 'Update post',
  })
  update(
    @Param('id', IdPipe) id: number,
    @Body() data: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    tags: ['post'],
    operationId: 'deletePost',
    summary: 'Delete post (soft)',
  })
  remove(@Param('id', IdPipe) id: number): Promise<PostEntity> {
    return this.postService.remove(id);
  }
}

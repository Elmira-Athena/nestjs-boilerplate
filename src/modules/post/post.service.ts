import { PageDto } from '@core/pagination/dto/page.dto';
import { PageMetaDto } from '@core/pagination/dto/page-meta.dto';
import { PageOptionsDto } from '@core/pagination/dto/page-option.dto';
import { Post } from '@database/typeorm/entities/post.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Post>> {
    const [data, itemCount] = await this.postRepository.findAndCount({
      order: { created_at: pageOptionsDto.order },
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.page_size,
    });

    return new PageDto(data, new PageMetaDto({ itemCount, pageOptionsDto }));
  }

  create(data: CreatePostDto): Promise<Post> {
    return this.postRepository.save(this.postRepository.create(data));
  }

  async update(id: number, data: UpdatePostDto): Promise<Post> {
    const post = await this.findOneOrFail(id);
    return this.postRepository.save(Object.assign(post, data));
  }

  async remove(id: number): Promise<Post> {
    const post = await this.findOneOrFail(id);
    return this.postRepository.softRemove(post);
  }

  private async findOneOrFail(id: number): Promise<Post> {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('POST-0001');
    return post;
  }
}

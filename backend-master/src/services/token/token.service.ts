import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { CreateTokenDto } from '../../models/token/dto/create-token.dto';

import { Token } from '../../models/token/token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private readonly manager: EntityManager,
  ) {}

  public async create(createToken: CreateTokenDto): Promise<any> {
    const item = await this.get({ uId: createToken.uId });

    if (item) {
      await this.delete(item.id)
    }

    const data = new Token({ ...createToken, expireAt: new Date() }); // Don't forget about add time
    await this.manager.save(data);
  }
  public async delete(id: number) {
    return await this.manager.query(`delete from public."token" where id = ${id}`)
  }
  public async get(payload: { [key: string]: string | number }) {
    return this.tokenRepository.findOne({ ...payload })
  }
  public async update() {}
  public async exist(id: number, content: string): Promise<boolean> {
    return !!(await this.tokenRepository.findOne({ id, content }));
  }
}

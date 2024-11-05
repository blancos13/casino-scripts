import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Buffer } from 'buffer';

import { Attachment } from '../../models/attachment/attachment.entity';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    private readonly manager: EntityManager,
  ) {}

  public async create(file: any): Promise<string> {
    const buffer: Buffer = file.buffer;
    const value = buffer.join(';');

    const fileUpload = new Attachment(value);
    await this.manager.save(fileUpload);

    return fileUpload.id;
  }
  public async update(file: any, id: string): Promise<boolean> {
    const data = await this.attachmentRepository.findOne({ id });
    if (!data) {
      throw new Error('Attachment object not found');
    }

    const buffer: Buffer = file.buffer;
    const value = buffer.join(';');

    await this.manager.query(
      `update public."attachment" set file = '${value}' where id = ${id}`,
    );

    return true;
  }
  public async delete(id: string): Promise<true> {
    await this.manager.query(
      `delete from public."attachment" where id = ${id}`,
    );
    return true;
  }
  public async get(id: string): Promise<any> {
    const fileUpload = await this.attachmentRepository.findOne({ id });
    return Buffer.from(fileUpload.file.split(';').map((byte) => +byte));
  }
}

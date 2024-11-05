import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Settings } from '../../models/settings/settings.entity';

import { ICreateSetting } from '../../models/settings/intefaces/create-setting.interface';
import { IReadSetting } from '../../models/settings/intefaces/read-setting.interface';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
    private readonly manager: EntityManager,
  ) {}

  public async create(data: ICreateSetting): Promise<boolean> {
    try {
      const newSetting = new Settings({ ...data });
      await this.manager.save(newSetting);

      return true;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  public async update(data: ICreateSetting): Promise<boolean> {
    const item = await this.get(data.key);

    if (!item) {
      throw new HttpException(
        `Setting with key = ${data.key} does not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return await this.manager.query(
      `update settings set value = '${data.value}' where key = '${data.key}'`,
    );
  }
  public async delete(key: string): Promise<boolean> {
    return await this.manager.query(
      `delete from settings where key = '${key}'`,
    );
  }
  public async get(key: string): Promise<string> {
    const data = await this.settingsRepository.findOne({ key })

    if (data.value || data.fid) {
      return data.value || data.fid
    }

    console.log('settings service key: ', key);

    throw new Error(`Setting with ket = ${key} not found!`)
  }
  public async getAll() {
    const data = await this.settingsRepository.find({});

    return data;
  }
}

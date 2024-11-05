import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import { SettingsService } from '../settings/settings.service';

import { SetItemDto } from '../../models/settings/dto/set-item.dto';
import { FaqDto } from './../../models/admin/dto/faq.dto';

import {
  RULES_PAGE_CONTENT,
  FAQ_PAGE_CONTENT,
  AVAILABLE_GAMES,
  PAYMENT,
  CHAT,
  SEO,
} from '../../constants/settings';

@Injectable()
export class AdminService {
  constructor(private readonly settingsService: SettingsService) {}

  public async setSetting(payload: SetItemDto, key: string): Promise<boolean> {
    const data = await this.settingsService.get(key);

    if (data) {
      return this.settingsService.update({ ...payload, key });
    } else {
      return this.settingsService.create({ ...payload, key });
    }
  }

  public async getSetting(key: string): Promise<any> {
    return await this.settingsService.get(key)
  }

  public async getAllSettings() {
    return await this.settingsService.getAll();
  }

  // Games
  public async getGames(): Promise<Array<string>> {
    return JSON.parse(await this.getSetting(AVAILABLE_GAMES))
  }

  public async setGames(payload: Array<string>): Promise<boolean> {
    try {
      await this.setSetting({ value: JSON.stringify(payload) }, AVAILABLE_GAMES)

      return true
    } catch (e) {
      throw new HttpException('Error save games setting: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  // /Games

  // Faq
  public async getFaq(admin: boolean): Promise<any> {
    return {
      seo: JSON.parse(await this.getSetting(SEO.FAQ_SEO)),
      content: JSON.parse(await this.getSetting(FAQ_PAGE_CONTENT))
    }
  }

  public async setFaq(payload: FaqDto, admin: boolean): Promise<boolean> {
    try {
      await this.setSetting({ value: JSON.stringify(payload.seo) }, SEO.FAQ_SEO)
      await this.setSetting({ value: JSON.stringify(payload.content) }, FAQ_PAGE_CONTENT)

      return true;
    } catch (e) {
      throw new HttpException('Error set faq page settings: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  // /Faq

  // Rules
  public async getRules(): Promise<any> {
    return {
      seo: JSON.parse(await this.getSetting(SEO.RULES_SEO)),
      content: JSON.parse(await this.getSetting(RULES_PAGE_CONTENT))
    }
  }

  public async setRules(payload: FaqDto): Promise<boolean> {
    try {
      await this.setSetting({ value: JSON.stringify(payload.seo) }, SEO.RULES_SEO)
      await this.setSetting({ value: JSON.stringify(payload.content) }, RULES_PAGE_CONTENT)

      return true;
    } catch (e) {
      throw new HttpException('Error set faq page settings: ' + e.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  // /Rules
}

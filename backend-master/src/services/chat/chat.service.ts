import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { paginate } from 'nestjs-typeorm-paginate';

import { UserService } from '../user/user.service';
import { GatewayService } from '../gateway/gateway.service';
import { SettingsService } from '../settings/settings.service';

import { Message } from '../../models/message/message.entity';

import { MessageDto } from '../../models/message/dto/message.dto';

import { ICreateMessage } from '../../models/message/interfaces/create-message.interface';

import { CHAT } from '../../constants/settings';
import WS_CHAT from '../../constants/websocket/chat';

import { statusEnum } from '../../models/user/enums/status.enum';
import { statusChatEnum } from '../../models/user/enums/status-chat.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    private readonly gatewayService: GatewayService,
    private readonly settingsService: SettingsService,
    private readonly manager: EntityManager,
  ) {}

  async get(): Promise<Array<MessageDto>> {
    const limit = +(
      await this.settingsService.get(CHAT.CHAT_LAST_COUNT_MESSAGES)
    )
    const page = 1;

    const messages = await paginate<Message>(this.messageRepository, {
      limit,
      page,
    });

    const result = []

    if (messages.items.length) {
      for (const { uid, ...data } of messages.items) {
        const user = (await this.userService.get({ id: +uid.id }))

        result.push({
          ...data,
          user: user.getFieldsForChat(),
        });
      }
    }

    return result;
  }

  async send() {
    const limit = +(await this.settingsService.get(CHAT.CHAT_LAST_COUNT_MESSAGES))
    const page = 1

    const messages = await paginate<Message>(this.messageRepository, {
      limit,
      page
    });

    const result = []

    if (messages.items.length) {
      for (const { uid, ...data } of messages.items) {
        const user = (await this.userService.get({ id: +uid.id }))

        result.push({
          ...data,
          user: user.getFieldsForChat(),
        });
      }
    }

    this.gatewayService.server.emit(WS_CHAT.NEW_MESSAGE, result);
  }

  async create(data: ICreateMessage): Promise<any> {
    const user = await this.userService.get({ id: data.userId });

    if (user.status !== statusEnum.payment) {
      return {
        error_message: 'chat.errors.need_payment'
      }
    }

    if (user.statusChat === statusChatEnum.ban) {
      return {
        error_message: 'chat.errors.ban'
      }
    }

    if (user.statusChat === statusChatEnum.mute) {
      return {
        error_message: 'chat.errors.mute'
      }
    }

    // Dont forget about mute

    const item = new Message({ ...data });
    await this.manager.save(item);

    await this.send()

    return true;
  }

  async delete(id: number): Promise<any> {
    try {
      await this.manager.query(
        `delete from public."message" where id = ${id}`,
      );

      await this.send()

      return true
    } catch (e) {

    }
  }
}

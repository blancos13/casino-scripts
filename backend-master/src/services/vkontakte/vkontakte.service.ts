import { Injectable, HttpService, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';

import { VkUserDto } from '../../models/user/dto/vk-user.dto';

import { configService } from '../../config/config.service';
import { SettingsService } from '../settings/settings.service';

import { API_VERSION } from '../../constants/vk';
import { MAIN_SITE_SETTINGS } from '../../constants/settings';

@Injectable()
export class VkontakteService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly groupSecret: string;
  private readonly groupId: string;
  private readonly clientService: string;

  private readonly ACCESS_URL = 'https://oauth.vk.com/access_token';
  private readonly USER_URL = [
    'https://api.vk.com/method/users.get?fields=photo_100,domain,contacts&name_case=nom&access_token=',
    '&v=',
  ];

  constructor(
    private readonly settingsService: SettingsService,
    private httpService: HttpService,
  ) {
    this.clientId = configService.getVkAuthConfig().clientId;
    this.clientSecret = configService.getVkAuthConfig().clientSecret;
    this.groupSecret = configService.getVkAuthConfig().groupSecret;
    this.groupId = configService.getVkAuthConfig().groupId;
    this.clientService = configService.getVkAuthConfig().clientService;
  }

  public async getUrl(): Promise<string> {
    const redirectUrl = await this.getRedirectURI()
    return `https://oauth.vk.com/authorize?client_id=${
      this.clientId
    }&response_type=code&scope=email&v=${API_VERSION}&redirect_uri=${redirectUrl}`;
  }
  public async getUserModel(code: string): Promise<VkUserDto> {
    const reqAccessUrl = `${this.ACCESS_URL}?client_id=${
      this.clientId
    }&client_secret=${
      this.clientSecret
    }&code=${code}&redirect_uri=${await this.getRedirectURI()}`;

    const access = (await this.httpService.get(reqAccessUrl).toPromise()).data;

    if (!access) {
      throw new UnauthorizedException();
    }

    let data = (
        await this.httpService
        .get(`${this.USER_URL[0]}${access
          .access_token}${this.USER_URL[1]}${API_VERSION}`)
        .toPromise()
    ).data.response[0]

    return { ...data, email: access.email };
  }

  public async isGroupMember(vkId: number): Promise<boolean> {
    const URL = `https://api.vk.com/method/groups.isMember?group_id=${this.groupId}&user_id=${vkId}&access_token=${this.clientService}&v=${API_VERSION}`;
    const response = (await this.httpService.get(URL).toPromise()).data.response;

    return response ? response.member === 1 : false;
  }

  public async isGroupMessageAvailable(vkId: number): Promise<boolean> {
    const URL = `https://api.vk.com/method/messages.isMessagesFromGroupAllowed?group_id=${this.groupId}&user_id=${vkId}&access_token=${this.clientService}&v=${API_VERSION}`;
    const response = (await this.httpService.get(URL).toPromise()).data.response;

    try {
      return response.is_allowed === 1;
    } catch (e) {
      return false;
    }
  }

  private async getRedirectURI(): Promise<string> {
    return new URL(
      '/auth/vk',
      await this.settingsService.get(MAIN_SITE_SETTINGS.BASE_URL),
    ).toString();
  }
}

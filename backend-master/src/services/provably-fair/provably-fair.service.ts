import { EntityManager } from 'typeorm';
import { UserService } from './../user/user.service';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto'

@Injectable()
export class ProvablyFairService {
  constructor(
    private readonly userService: UserService,
    private readonly manager: EntityManager
  ) {}

  async getUserSeed(userId: number): Promise<any> {
    const user = await this.userService.get(userId)

    if (!user.clientSeed) {
      user.clientSeed = this.sha512(user.id + '')
      await this.manager.save(user)
    }

    return user.clientSeed
  }

  sha512(str: string) {
    return crypto.createHash('sha512').update(str).digest('hex');
  }
  
  generateServerSeed() {
    return crypto.randomBytes(256).toString('hex')
  }

  combine(serverSeed: string, clientSeed: string, nonce?: string) {
    return serverSeed + clientSeed + nonce
  }

  async generateSeedRange(min: number, max: number, userId: number, nonce?: string) {
    let seed = null;
    try {
        const client = await this.getUserSeed(userId)

        while(seed == null) {
            const server_seed = this.generateServerSeed();
            
            const v = (this.provably_fair(server_seed, client, nonce == null ? '' : nonce));

            if(v >= min && v <= max) {
                seed = server_seed;
                break;
            }
        }
    } catch (e) {
        seed = 'Error';
    }
    return seed;
  }

  provably_fair(server: string, client: string, nonce?: string): number {
    return this.getResult(
      this.sha512(
        this.combine(
          server,
          client,
          nonce
        )
      )
    )
  }

  getResult(hashedValue: string) {
    let index = 0;
    let result = 0;

    do {
      result = parseInt(hashedValue.substring(index * 5, index * 5 + 5), 16);
      index += 1;
      
      if (index * 5 + 5 > 129) {
        result = 9999;
        break;
      }
    } while (result >= 1e6);
    // return (result % 1e4) * 1e-2;
    return result % 1e4
  }
}

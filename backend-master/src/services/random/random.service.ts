import { Injectable } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Chance = require('chance');

@Injectable()
export class RandomService {
  private chance: any;

  constructor() {
    this.chance = new Chance()
  }

  public getRandom(min: number, max: number): Promise<number> {
    const random = this.chance.integer({ min: min, max: max })
    return Promise.resolve(random);
  }
}

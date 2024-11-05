import { Repository, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { TypeUpPayment } from '../../models/user/user-balance-change.entity'

import { randomString } from '../../helpers/randomString';

import { CreateUserDto } from '../../models/user/dto/create-user.dto';

import { User } from '../../models/user/user.entity';

import { statusEnum } from '../../models/user/enums/status.enum';

@Injectable()
export class UserService {
  private readonly saltRound = 10;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly manager: EntityManager,
  ) {}

  async create(
    { password, ...userData }: CreateUserDto,
    randomCode: string = null,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ email: userData.email });

    if (!user) {
      if (!password) {
        password = randomString(20);
      }

      const passwordHash = await this.hash(password);

      // Don't forget about promo code
      const newUser = new User({
        ...userData,
        passwordHash,
        randomCode
      });

      await this.manager.save(newUser);

      return newUser;
    }

    return user;
  }

  async get(data: any): Promise<User> {
    return await this.userRepository.findOne({ ...data });
  }

  public async getBalance(userId: number, manager: EntityManager): Promise<number> {
    return (await manager.query('select balance from public."user" where id = ' + userId))[0].balance.toFixed(2);
  }

  public async getDemoBalance(userId: number, manager: EntityManager): Promise<number> {
    return (await manager.query('select demo_balance from public."user" where id = ' + userId))[0].demo_balance.toFixed(2);
  }

  public async refresh(user: User): Promise<User> {
    return this.userRepository.findOne({ id: user.id });
  }

  async changeBalance({ id, ...data }, manag?: EntityManager, description?: string): Promise<boolean> {
    const keys = Object.keys(data);
    const manager = manag ? manag : this.manager
    const type = keys[0] === 'balance' ? TypeUpPayment.BALANCE : TypeUpPayment.DEMO_BALANCE

    if (keys.length > 1) {
      throw new Error('Max one value update');
    }

    try {
      await manager.query(`insert into user_balance_change (user_id,type,old_balance,new_balance,change,description, date) values (
        ${id},
        ${type},
        (select balance from public."user" where id = ${id}),
        (select balance + ${data[keys[0]]} from public."user" where id = ${id}),
        ${data[keys[0]]},
         $1,
         $2
         )`, [description, new Date()])

      if (keys[0] === 'balance') {
        await manager.increment(User, { id }, '_balance', +data.balance.toFixed(2));;
      } else if (keys[0] === 'demoBalance') {
        await manager.increment(User, { id }, '_demoBalance', +data.demoBalance.toFixed(2));;
      }

      return true
    } catch (e) {}
  }

  async update({ id, ...data }: any, isPassword = false): Promise<any> {
    let user = await this.get({ id });

    if (isPassword) {  
      user.status = statusEnum.new;
      user.passwordHash = await this.hash(data.password);

      await this.manager.save(user);
    } else {
      const keys = Object.keys(data)

      if (keys.length < 2) {
        return await this.manager.query(
          `update public."user" set ${keys[0]} = '${
            data[keys[0]]
          }' where id = ${id}`,
        );
      }
      
      let keysText = `(`
      let values = `(`

      keys.forEach((itm, idx, arr) => {
        if (idx < arr.length - 1) {
          keysText += idx < 1 ? `${itm}` : `, ${itm}` 
          values += idx < 1 ? `${data[itm]}` : `, ${data[itm]}`
        } else {
          keysText += `, ${itm})`
          values += `, ${data[itm]})`
        }
      })

      return await this.manager.query(
        `update public."user" set ${keysText} = '${values}' where id = ${id}`,
      );
    }
  }

  async hash(data: string): Promise<string> {
    const salt = await genSalt(this.saltRound);

    return hash(data, salt);
  }
}

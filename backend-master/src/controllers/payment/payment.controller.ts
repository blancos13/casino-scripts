import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Connection } from 'typeorm';
import { IsNumber, Min } from 'class-validator';
import { PhoneVerification } from './../../models/phone-verification/phone-verification.entity';
import { UserService } from './../../services/user/user.service';
import { UnitpayIncome } from './../../models/payment/unitpay.entity';
import { GatewayService } from './../../services/gateway/gateway.service';
import { AuthGuard } from './../../middlewares/auth/auth.guard';
import { MoneyOutcomeStatus, MoneyOutcome } from 'src/models/payment/outcome.entity';
import { MoneyIncomeStatus } from 'src/models/payment/income.entity';
import {
  PaymentDirection,
  PaymentFormView,
  PaymentService,
  PaymentPageSettings,
} from 'src/services/payment/PaymentService';
import { NewBalanceBody } from '../../services/gateway/gateway.service'
import WS_BALANCE from '../../constants/websocket/balance'
import { FreeKassaService } from '../../services/payment/FreeKassaService';

class MoneyIncomeView {
  constructor(
    public date: Date,
    public direction: PaymentDirection,
    public status: MoneyIncomeStatus,
    public sum: number
  ) {
  }
}

class MoneyOutcomeView {
  constructor(
    public date: Date,
    public direction: PaymentDirection,
    public status: MoneyOutcomeStatus,
    public sum: number
  ) {
  }
}

class GetPaymentUrlRequest {
  @IsNumber()
  @Min(0, {message: 'Сумма пополнения должна быть больше 0'})
  public sum: number;
  public direction: PaymentDirection;
  public params: any;
}

class RequestMoneyOutcome {
  @IsNumber()
  public sum: number;
  public params: any;
  public direction: PaymentDirection;
  public verificationUUID: string;
}


@Controller('/payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private userService: UserService,
    private freeKassaService : FreeKassaService,
    private connection: Connection) {
  }

  @Get("/page/settings")
  @UseGuards(new AuthGuard())
  async getPageSettings(@Req() req) : Promise<PaymentPageSettings> {
    return this.paymentService.getPageInfo(req.user);
  }

  @Post("/url")
  @UseGuards(new AuthGuard())
  async getPaymentUrl(
    @Req() req: any,
    @Body() body : GetPaymentUrlRequest
  ) : Promise<PaymentFormView> {
    return this.paymentService.getIncomeUrl(body.sum, body.direction, body.params, req.user);
  }

  @Post("/withdraw")
  @UseGuards(new AuthGuard())
  async requestWithdraw(@Req() req, @Body() body : RequestMoneyOutcome) : Promise<void> {
    if(!req.user.isPhoneVerified || !body.verificationUUID) {
      throw new BadRequestException('Необходимо верифицировать номер телефона');
    }

    const verification = await this.connection.manager.findOne(PhoneVerification, {where: {user: req.user, phone: req.user.phoneVerified}, order: {date: -1}});
    if(!verification || body.verificationUUID !== verification.acceptedUUID) {
      throw new BadRequestException('Необходимо подтвердить вывод по коду');
    }

    const outcome = await this.paymentService.registerOutcomeRequest(body.sum,body.params, body.direction, req.user);
    GatewayService.broadcastStaticUser(WS_BALANCE.NEW_BALANCE, JSON.stringify(new NewBalanceBody(+(outcome.sum + outcome.commission + outcome.startBalance).toFixed(2), await this.userService.getBalance(req.user.id, this.connection.manager))), req.user.id);
  }

  @Get("/history/withdraw")
  @UseGuards(new AuthGuard())
  async withdrawHistory(@Req() req) : Promise<MoneyOutcomeView[]> {
    return (await this.paymentService.getUserOutcomes(req.user)).map(income => new MoneyOutcomeView(income.date, income.direction, income.status, income.sum));
  }

  @Get("/history/withdraw/all/today")
  async todayGlobalWithdrawHistory() : Promise<MoneyOutcome[]> {
    return this.paymentService.getOutcomes();
  }

  @Get("/history/income")
  @UseGuards(new AuthGuard())
  async incomeHistory(@Req() req) : Promise<MoneyIncomeView[]> {
    return (await this.paymentService.getUserIncomes(req.user)).map(income => new MoneyIncomeView(income.date, income.direction, income.status, income.sum));
  }

  @Post('/piastrix')
  async piastrixCallback(@Headers('x-real-ip') ip, @Body() body: any): Promise<string> {
    if (!['51.68.53.104', '51.68.53.105', '51.68.53.106', '51.68.53.107', '37.48.108.180', '37.48.108.181'].includes(ip)) {
      throw new BadRequestException();
    }

    if (body.status === 'success') {
      await this.paymentService.acceptIncome(body.shop_order_id);
    } else if (body.status === 'rejected') {
      await this.paymentService.rejectIncome(body.shop_order_id);
    } else {
      throw new BadRequestException();
    }

    return 'OK';
  }

  @Post('/unitpay')
  async unitpayCallback(@Headers('x-real-ip') ip, @Query('method') method: string, @Query('unitpayId') transationid: number): Promise<any> {
    if (!['31.186.100.49', '178.132.203.105', '52.29.152.23', '52.19.56.234'].includes(ip)) {
      throw new BadRequestException();
    }

    const unitpayIncome = await this.connection.manager.findOne(UnitpayIncome, {id: transationid});
    if(!unitpayIncome) {
      throw new NotFoundException();
    }

    const successAnswer = {
      'result': {
        'message': 'Запрос успешно обработан',
      },
    };
    if(method === 'check') {
    } else if(method === 'pay') {
      await this.paymentService.acceptIncome(unitpayIncome.income.id);
    } else if(method === 'error') {
      await this.paymentService.rejectIncome(unitpayIncome.income.id);
    } else {
      throw new BadRequestException();
    }

    return successAnswer;
  }

  @Post('/payeer')
  async payeerCallback(@Headers('x-real-ip') ip, @Body() body : any): Promise<any> {
    if (!['185.71.65.92', '185.71.65.189', '149.202.17.210'].includes(ip)) {
      throw new BadRequestException();
    }

    const successAnswer = {
      'result': {
        'message': 'Запрос успешно обработан',
      },
    };

    if(body.m_status === 'success') {
      await this.paymentService.acceptIncome(body.m_orderid);
    } else {
      await this.paymentService.rejectIncome(body.m_orderid);
    }

    return successAnswer;
  }

  @Get('/free-kassa')
  async freeKassaCallback(@Headers('x-real-ip') ip, @Query('MERCHANT_ORDER_ID') orderId: string): Promise<any> {
    // if (!['136.243.38.147', '136.243.38.149', '136.243.38.150', '136.243.38.151', '136.243.38.189', '136.243.38.108'].includes(ip)) {
    //   throw new BadRequestException();
    // }

    console.log('PAYMENT');

    try {
      const result = await this.freeKassaService.isOrderCompleted(+orderId);
      console.log(result);
    } catch (e) {
      console.log(e);
    }
    if(await this.freeKassaService.isOrderCompleted(+orderId)) {
      await this.paymentService.acceptIncome(+orderId);
      return 'YES';
    }
    throw new BadRequestException();
  }

}

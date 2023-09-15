/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { OrderState, PaymentMethod } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly order: number;
    readonly paymentmethod: number;
    readonly amount: number;
}

export class CloseOrder extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates an order';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'id of balance account'),
        new CoreJS.NumberParameter('order', 'id of order to close'),
        new CoreJS.NumberParameter('paymentmethod', 'order payment method'),
        new CoreJS.NumberParameter('amount', 'amout of payment')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        switch (args.paymentmethod) {
            case PaymentMethod.Balance:
            case PaymentMethod.Cash:
                break;

            default:
                return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid_payment_method');
        }

        const order = await this.context.orderRepository.getOrder(args.order);

        if (OrderState.Open != order.state)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_not_open');

        const invoice = await this.context.orderRepository.getInvoice(args.order);

        const tip = args.amount - invoice;

        if (0 > tip)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_not_enough_amount');

        const result = await this.context.orderRepository.closeOrder(args.order, args.paymentmethod, tip);

        if (!result)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_open_already');

        if (PaymentMethod.Balance == args.paymentmethod) {
            await this.context.balanceRepository.decrease({
                account: args.account,
                depot: order.customer,
                asset: 1,
                product: order.id,
                value: invoice,
                data: 'order invoice',
            });
        }

        return new CoreJS.JSONResponse(result);
    }
}
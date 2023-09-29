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
    readonly paymentmethod: PaymentMethod;
    readonly amount: number;
}

export class CloseOrder extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'closes an open order';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
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

        if (!order)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid');

        if (order.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        if (order.state != OrderState.Open)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_not_open');

        const invoice = await this.context.orderRepository.getInvoice(args.order);

        if (args.amount < invoice)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_not_enough_amount');

        const tip = args.amount - invoice;
        const result = await this.context.orderRepository.closeOrder(args.order, args.paymentmethod, tip);

        if (!result)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid');

        // decrease customer balance by invoice
        await this.context.balanceRepository.decrease({
            account: result.account,
            depot: result.customer,
            order: result.id,
            asset: result.paymentMethod,
            value: invoice,
            data: 'invoice',
        });

        if (tip) {
            // decrease customer balance by tip
            await this.context.balanceRepository.decrease({
                account: result.account,
                depot: result.customer,
                order: result.id,
                asset: args.paymentmethod,
                value: tip,
                data: 'tip',
            });
        }

        return new CoreJS.JSONResponse(result);
    }
}
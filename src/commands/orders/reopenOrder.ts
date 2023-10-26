/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { BalanceEvent, OrderState, PaymentMethod } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly order: number;
}

export class ReopenOrder extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'reopens an open order and increases balance by previous paid invoice + tip';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('order', 'id of order to close')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const order = await this.context.orderRepository.getOrder(args.order);

        if (!order)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid');

        if (order.account != args.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        if (order.state != OrderState.Closed)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_not_closed');

        const invoice = await this.context.orderRepository.getInvoice(args.order);
        const result = await this.context.orderRepository.reopenOrder(args.order);

        if (!result)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_order_invalid');

        // increase customer balance by previous invoice
        await this.context.balanceRepository.increase({
            account: order.account,
            depot: order.customer,
            order: order.id,
            asset: order.paymentMethod,
            value: invoice,
            data: BalanceEvent.UndoInvoice,
        });

        if (order.tip) {
            // increase customer balance by previous tip
            await this.context.balanceRepository.increase({
                account: order.account,
                depot: order.customer,
                order: order.id,
                asset: order.paymentMethod,
                value: order.tip,
                data: BalanceEvent.UndoTip,
            });
        }

        return new CoreJS.JSONResponse(result);
    }
}
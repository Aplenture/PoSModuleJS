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
}

export class CloseAllOpenBalanceOrders extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'closes all open orders with balance as payment method';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = [];

        await this.context.orderRepository.fetchOrders(args.account, async order => {
            const closedOrder = await this.context.orderRepository.closeOrder(order.id, order.paymentMethod);
            const invoice = await this.context.orderRepository.getInvoice(order.id);

            // decrease customer balance by invoice
            await this.context.balanceRepository.decrease({
                account: order.account,
                depot: order.customer,
                order: order.id,
                asset: order.paymentMethod,
                value: invoice,
                data: 'invoice',
            });

            result.push(closedOrder);
        }, {
            state: OrderState.Open,
            paymentMethod: PaymentMethod.Balance
        });

        return new CoreJS.JSONResponse(result);
    }
}
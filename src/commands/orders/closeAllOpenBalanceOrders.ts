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
        const orders = await this.context.orderRepository.getOrders(args.account, {
            state: OrderState.Open,
            paymentMethod: PaymentMethod.Balance
        });

        const result = await Promise.all(orders.map(async order => {
            const result = await this.context.orderRepository.closeOrder(order.id, order.paymentMethod);
            const invoice = await this.context.orderRepository.getInvoice(order.id);

            await this.context.balanceRepository.decrease({
                account: result.account,
                depot: result.customer,
                order: result.id,
                asset: result.paymentMethod,
                value: invoice,
                data: 'invoice',
            });

            return result;
        }));

        return new CoreJS.JSONResponse(result);
    }
}
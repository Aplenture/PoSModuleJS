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
    readonly time: number;

}

export class CloseAllOpenBalanceOrders extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'closes all open orders with balance as payment method';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.TimeParameter('time', 'closing timestamp', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = [];
        const date = args.time
            ? new Date(args.time)
            : new Date();

        await this.context.orderRepository.fetchOrders(args.account, async order => {
            if (!await this.context.customerRepository.canPayWith(order.customer, PaymentMethod.Balance))
                return;

            const closedOrder = await this.context.orderRepository.closeOrder({ id: order.id, paymentMethod: PaymentMethod.Balance, time: args.time });
            const invoice = await this.context.orderRepository.getInvoice(order.id);

            // decrease customer balance by invoice
            await this.context.balanceRepository.decrease({
                account: order.account,
                date,
                depot: order.customer,
                order: order.id,
                asset: PaymentMethod.Balance,
                value: invoice,
                data: BalanceEvent.Invoice,
            });

            result.push(closedOrder);
        }, { state: OrderState.Open });

        return new CoreJS.JSONResponse(result);
    }
}
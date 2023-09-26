/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { OrderState } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly customer: number;
    readonly start: number;
    readonly state: OrderState;
}

export class GetOrders extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns orders and products of a month';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id of order', null),
        new CoreJS.NumberParameter('start', 'start timestamp of orders', null),
        new CoreJS.NumberParameter('state', 'order state', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const firstOfMonth = args.start
            ? CoreJS.calcUTCDate({ date: new Date(args.start), monthDay: 1 })
            : CoreJS.calcUTCDate({ monthDay: 1 });

        const firstOfNextMonth = CoreJS.addUTCDate({ date: firstOfMonth, months: 1 });

        const orders = await this.context.orderRepository.getOrders(args.account, {
            state: args.state,
            customer: args.customer,
            start: Number(firstOfMonth),
            end: Number(firstOfNextMonth)
        });

        const result = await Promise.all(orders.map(async order => Object.assign(order, {
            products: await this.context.orderRepository.getProducts(order.id)
        })));

        return new CoreJS.JSONResponse(result);
    }
}
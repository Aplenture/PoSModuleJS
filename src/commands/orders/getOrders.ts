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

const MAX_DURATION = CoreJS.Milliseconds.Day * 32; // one more than highest month lenght

interface Args extends GlobalArgs {
    readonly account: number;
    readonly customer: number;
    readonly start: number;
    readonly end: number;
    readonly state: OrderState;
}

export class GetOrders extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns orders and products of a month or day';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id of order', null),
        new CoreJS.TimeParameter('start', 'start timestamp of orders', null),
        new CoreJS.TimeParameter('end', 'end timestamp of orders', null),
        new CoreJS.NumberParameter('state', 'order state', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        // if start not set calc start by end or now and max duration
        const start = args.start || ((args.end || Date.now()) - MAX_DURATION);

        // clamp end by start + max duration
        const end = Math.min(args.end || (start + MAX_DURATION), start + MAX_DURATION);

        const orders = await this.context.orderRepository.getOrders(args.account, {
            state: args.state,
            customer: args.customer,
            start,
            end
        });

        const result = await Promise.all(orders.map(async order => Object.assign(order, {
            products: await this.context.orderRepository.getProducts(order.id)
        })));

        return new CoreJS.JSONResponse(result);
    }
}
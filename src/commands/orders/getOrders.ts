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
    readonly timeframe: CoreJS.TimeFrame;
}

export class GetOrders extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns orders and products of a month or day';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id of order', null),
        new CoreJS.NumberParameter('start', 'start timestamp of orders', null),
        new CoreJS.NumberParameter('state', 'order state', null),
        new CoreJS.NumberParameter('timeframe', 'supports day and month', CoreJS.TimeFrame.Month)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const start = CoreJS.TimeFrame.Month == args.timeframe
            ? args.start
                ? CoreJS.calcDate({ date: new Date(args.start), monthDay: 1 })
                : CoreJS.calcDate({ monthDay: 1 })
            : CoreJS.TimeFrame.Day == args.timeframe
                ? args.start
                    ? CoreJS.calcDate({ date: new Date(args.start) })
                    : CoreJS.calcDate()
                : null;

        if (!start)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_time_frame_invalid");

        const end = CoreJS.TimeFrame.Month == args.timeframe
            ? CoreJS.addDate({ date: start, months: 1 })
            : CoreJS.TimeFrame.Day == args.timeframe
                ? CoreJS.addDate({ date: start, days: 1 })
                : null;

        if (!end)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_time_frame_invalid");

        const orders = await this.context.orderRepository.getOrders(args.account, {
            state: args.state,
            customer: args.customer,
            start: Number(start),
            end: Number(end)
        });

        const result = await Promise.all(orders.map(async order => Object.assign(order, {
            products: await this.context.orderRepository.getProducts(order.id)
        })));

        return new CoreJS.JSONResponse(result);
    }
}
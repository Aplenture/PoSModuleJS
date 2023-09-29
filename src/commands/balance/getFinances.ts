/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly customer: number;
    readonly start: number;
    readonly timeframe: CoreJS.TimeFrame;
}

export class GetFinances extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns finances of a month or day';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id', null),
        new CoreJS.NumberParameter('start', 'start timestamp of finances', null),
        new CoreJS.NumberParameter('timeframe', 'supports day and month', CoreJS.TimeFrame.Month)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const start = CoreJS.TimeFrame.Month == args.timeframe
            ? args.start
                ? CoreJS.calcUTCDate({ date: new Date(args.start), monthDay: 1 })
                : CoreJS.calcUTCDate({ monthDay: 1 })
            : CoreJS.TimeFrame.Day == args.timeframe
                ? args.start
                    ? CoreJS.calcUTCDate({ date: new Date(args.start) })
                    : CoreJS.calcUTCDate()
                : null;

        if (!start)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_time_frame_invalid");

        const end = CoreJS.TimeFrame.Month == args.timeframe
            ? CoreJS.addUTCDate({ date: start, months: 1 })
            : CoreJS.TimeFrame.Day == args.timeframe
                ? CoreJS.addUTCDate({ date: start, days: 1 })
                : null;

        if (!end)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, "#_time_frame_invalid");

        const data = args.customer
            ? null
            : ['invoice', 'tip'];

        const invoices = await this.context.balanceRepository.getEvents(args.account, {
            start: Number(start),
            end: Number(end),
            depot: args.customer,
            data
        });

        return new CoreJS.JSONResponse(invoices.map(data => ({
            id: data.id,
            timestamp: data.timestamp,
            type: data.type,
            account: data.account,
            customer: data.depot,
            paymentMethod: data.asset,
            order: data.order,
            value: data.value,
            data: data.data
        })));
    }
}
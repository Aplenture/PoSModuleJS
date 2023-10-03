/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";

const MAX_DURATION = CoreJS.Milliseconds.Day * 32; // one more than highest month lenght

interface Args extends GlobalArgs {
    readonly account: number;
    readonly customer: number;
    readonly start: number;
    readonly end: number;
    readonly timeframe: CoreJS.TimeFrame;
}

export class GetFinances extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns finances of a month or day';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id', null),
        new CoreJS.TimeParameter('start', 'start timestamp of finances', null),
        new CoreJS.TimeParameter('end', 'end timestamp of orders', null),
        new CoreJS.NumberParameter('timeframe', 'supports day and month', CoreJS.TimeFrame.Month)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        // if start not set calc start by end or now and max duration
        const start = args.start || ((args.end || Date.now()) - MAX_DURATION);

        // clamp end by start + max duration
        const end = Math.min(args.end || (start + MAX_DURATION), start + MAX_DURATION);

        const data = args.customer
            ? null
            : ['invoice', 'tip'];

        const invoices = await this.context.balanceRepository.getEvents(args.account, {
            depot: args.customer,
            start,
            end,
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
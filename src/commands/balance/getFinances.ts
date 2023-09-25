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
}

export class GetFinances extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns list of sales';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id', null),
        new CoreJS.NumberParameter('start', 'start timestamp of finances', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const firstOfMonth = args.start
            ? CoreJS.calcUTCDate(new Date(args.start), 1)
            : CoreJS.calcUTCDate(new Date(), 1);

        const firstOfNextMonth = CoreJS.addUTCDate({ date: firstOfMonth, months: 1 });

        const data = args.customer
            ? null
            : ['invoice', 'tip'];

        const invoices = await this.context.balanceRepository.getEvents(args.account, {
            start: Number(firstOfMonth),
            end: Number(firstOfNextMonth),
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
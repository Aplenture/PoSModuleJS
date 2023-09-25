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
    readonly start: number;
}

export class GetSales extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns list of sales';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('start', 'start timestamp of sales')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const invoices = await this.context.balanceRepository.getEvents(args.account, {
            data: ['invoice', 'tip'],
            start: args.start
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
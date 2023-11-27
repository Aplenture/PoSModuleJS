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

const MAX_DURATION = CoreJS.Milliseconds.Day * 32; // one more than highest month lenght

interface Args extends GlobalArgs {
    readonly account: number;
    readonly start: number;
    readonly end: number;
}

export class GetTransfers extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns all transfers of a month or day';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.TimeParameter('start', 'start timestamp of finances', null),
        new CoreJS.TimeParameter('end', 'end timestamp of orders', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const transactionLabels = await this.context.transactionLabelRepository.getAll(args.account);

        // if start not set calc start by end or now and max duration
        const start = args.start || ((args.end || Date.now()) - MAX_DURATION);

        // clamp end by start + max duration
        const end = Math.min(args.end || (start + MAX_DURATION), start + MAX_DURATION);

        const result = [];

        const events = await this.context.balanceRepository.getEvents(args.account, {
            start,
            end,
            data: [BalanceEvent.Deposit as string, BalanceEvent.Withdraw as string].concat(transactionLabels.map(data => data.name)),
        });

        events.forEach(data => result.push({
            id: data.id,
            account: data.account,
            timestamp: data.timestamp,
            type: data.type,
            customer: data.depot,
            order: data.order,
            paymentMethod: data.asset,
            value: data.value,
            data: data.data
        }));

        return new CoreJS.JSONResponse(result);
    }
}
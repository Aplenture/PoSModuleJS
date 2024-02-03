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
    readonly customer: number;
    readonly start: number;
    readonly end: number;
    readonly paymentmethod: PaymentMethod;
    readonly data: readonly string[];
}

export class GetFinances extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns finances of a month or day';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id', null),
        new CoreJS.TimeParameter('start', 'start timestamp of finances', null),
        new CoreJS.TimeParameter('end', 'end timestamp of orders', null),
        new CoreJS.NumberParameter('paymentmethod', 'method of payment', null),
        new CoreJS.ArrayParameter('data', 'array of finance data', new CoreJS.StringParameter('', ''), null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        if (!await this.context.customerRepository.hasPermissions(args.account, args.customer))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        // if start not set calc start by end or now and max duration
        const start = args.start || ((args.end || Date.now()) - MAX_DURATION);

        // clamp end by start + max duration
        const end = Math.min(args.end || (start + MAX_DURATION), start + MAX_DURATION);

        const result = [];
        const options = {
            depot: args.customer,
            start,
            end,
            asset: args.paymentmethod,
            data: args.data,
            groupDepots: !args.customer
        };

        const events = args.customer
            ? await this.context.balanceRepository.getEvents(args.account, options)
            : await this.context.balanceRepository.getEventSum(args.account, options);

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

        if (args.customer) {
            const previousBalances = args.start ? await this.context.balanceRepository.getBalance(args.account, {
                asset: PaymentMethod.Balance,
                depot: args.customer,
                time: args.start - 1,
                limit: 1
            }) : [];

            const openOrders = await this.context.orderRepository.getOrders(args.account, {
                state: OrderState.Open,
                customer: args.customer,
                start,
                end
            });

            previousBalances.forEach(data => result.push({
                account: data.account,
                timestamp: data.timestamp,
                type: BackendJS.Balance.EventType.Increase,
                customer: data.depot,
                paymentMethod: data.asset,
                value: data.value,
                data: BalanceEvent.PreviousBalance
            }));

            await Promise.all(openOrders.map(async data => result.push({
                account: data.account,
                timestamp: data.updated,
                type: BackendJS.Balance.EventType.Decrease,
                customer: data.customer,
                order: data.id,
                paymentMethod: data.paymentMethod,
                value: await this.context.orderRepository.getInvoice(data.id),
                data: BalanceEvent.OpenInvoice
            })));
        }

        return new CoreJS.JSONResponse(result);
    }
}
/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { BalanceEvent, PaymentMethod } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly customer: number;
    readonly value: number;
    readonly date: number;
}

export class WithdrawBalance extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'decreases a balance';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id'),
        new CoreJS.NumberParameter('value', 'amount of decrease'),
        new CoreJS.TimeParameter('date', 'when was the deposit', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        if (!await this.context.customerRepository.hasPermissions(args.account, args.customer))
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        const result = await this.context.balanceRepository.decrease({
            date: args.date && new Date(args.date) || null,
            account: args.account,
            depot: args.customer,
            order: 0,
            asset: PaymentMethod.Balance,
            value: args.value,
            data: BalanceEvent.Withdraw
        });

        return new CoreJS.JSONResponse({
            timestamp: result.timestamp,
            account: result.account,
            customer: result.depot,
            paymentMethod: result.asset,
            value: result.value
        });
    }
}
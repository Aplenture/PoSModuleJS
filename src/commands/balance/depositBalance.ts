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
import { executeBonus } from "../../utils";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly customer: number;
    readonly value: number;
    readonly date: number;
    readonly label: string;
}

export class DepositBalance extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'increases a balance';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('customer', 'customer id'),
        new CoreJS.NumberParameter('value', 'amount of increase'),
        new CoreJS.TimeParameter('date', 'when was the deposit', null),
        new CoreJS.StringParameter('label', 'transaction label', BalanceEvent.Deposit)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const customer = await this.context.customerRepository.get(args.customer);

        if (args.account != customer.account)
            return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_permission_denied');

        const deposit = await this.context.balanceRepository.increase({
            date: args.date && new Date(args.date) || null,
            account: args.account,
            depot: args.customer,
            order: 0,
            asset: PaymentMethod.Balance,
            value: args.value,
            data: args.label
        });

        const bonus = await executeBonus(args.account, customer, this.context, args.date);

        const result = bonus || deposit;

        return new CoreJS.JSONResponse({
            timestamp: result.timestamp,
            account: result.account,
            customer: result.depot,
            paymentMethod: result.asset,
            value: result.value
        });
    }
}
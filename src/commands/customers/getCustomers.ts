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
    readonly firstID: number;
    readonly lastID: number;
    readonly paymentmethods: number;
}

export class GetCustomers extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns all customers';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('firstID', 'id of first returning customer', null),
        new CoreJS.NumberParameter('lastID', 'id of last returned customer', null),
        new CoreJS.NumberParameter('paymentmethods', 'payment methods bit mask to filter returning customers', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.customerRepository.getAll(args.account, {
            firstID: args.firstID,
            lastID: args.lastID,
            paymentMethods: args.paymentmethods
        });

        return new CoreJS.JSONResponse(result);
    }
}
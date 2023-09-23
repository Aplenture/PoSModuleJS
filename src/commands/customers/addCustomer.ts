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
    readonly firstname: string;
    readonly lastname: string;
    readonly nickname: string;
    readonly paymentmethods: number;
}

export class AddCustomer extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates a customer';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.StringParameter('firstname', 'firstname of customer'),
        new CoreJS.StringParameter('lastname', 'lastname of customer', ''),
        new CoreJS.StringParameter('nickname', 'nickname of customer', ''),
        new CoreJS.NumberParameter('paymentmethods', 'bitmap of all allowed customer payment methods', -1)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.customerRepository.create(args.account, args.firstname, args);

        return new CoreJS.JSONResponse(result);
    }
}
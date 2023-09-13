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
    readonly firstname: string;
    readonly lastname: string;
    readonly nickname: string;
}

export class CreateCustomer extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates a customer';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.StringParameter('firstname', 'firstname of customer'),
        new CoreJS.StringParameter('lastname', 'lastname of customer'),
        new CoreJS.StringParameter('nickname', 'nickname of customer', '')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.customerRepository.create(
            args.firstname,
            args.lastname,
            args.nickname
        );

        return new CoreJS.JSONResponse(result);
    }
}
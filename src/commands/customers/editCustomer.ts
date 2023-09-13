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
    readonly id: number;
    readonly firstname: string;
    readonly lastname: string;
    readonly nickname: string;
}

export class EditCustomer extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'changes the properties of a customer';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('id', 'id of customer'),
        new CoreJS.StringParameter('firstname', 'firstname of customer', null),
        new CoreJS.StringParameter('lastname', 'firstname of customer', null),
        new CoreJS.StringParameter('nickname', 'firstname of customer', null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.customerRepository.edit(args.id, args);

        return new CoreJS.BoolResponse(result);
    }
}
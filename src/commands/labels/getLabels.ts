/**
 * Aplenture/PoSModuleJS
 * https://github.com/Aplenture/PoSModuleJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/PoSModuleJS/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../../core";
import { LabelType } from "../../enums";

interface Args extends GlobalArgs {
    readonly account: number;
    readonly type: LabelType[];
}

export class GetLabels extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'returns all labels from an account';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.ArrayParameter('type', 'array of label types', new CoreJS.NumberParameter('', ''), [])
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const result = await this.context.labelRepository.getAll(args.account, ...args.type);

        return new CoreJS.JSONResponse(result);
    }
}
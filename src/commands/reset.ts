/**
 * Aplenture/<my_module_name>
 * https://github.com/Aplenture/<my_module_name>
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/<my_module_name>/blob/main/LICENSE
 */

import * as BackendJS from "backendjs";
import * as CoreJS from "corejs";
import { Args as GlobalArgs, Context, Options } from "../core";

interface Args extends GlobalArgs {
    readonly versions: readonly number[];
}

export class Reset extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'resets the database';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.ArrayParameter('versions', 'resets these versions only', new CoreJS.NumberParameter('', ''), null)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        await this.context.myRepository.reset({ versions: args.versions });

        return new CoreJS.TextResponse('reset');
    }
}
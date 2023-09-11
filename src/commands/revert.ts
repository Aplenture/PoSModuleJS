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
    readonly version: number;
}

export class Revert extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'rolls back the database';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('version', 'reverts to this version', 0)
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        const version = await this.context.myRepository.revert({ minVersion: args.version });

        return new CoreJS.TextResponse('reverted to version ' + version);
    }
}
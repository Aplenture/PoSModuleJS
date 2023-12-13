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
    readonly type: LabelType;
    readonly name: string;
}

export class CreateLabel extends BackendJS.Module.Command<Context, Args, Options> {
    public readonly description = 'creates a label for an account';
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.NumberParameter('account', 'account id'),
        new CoreJS.NumberParameter('type', 'type of label'),
        new CoreJS.StringParameter('name', 'name of label')
    );

    public async execute(args: Args): Promise<CoreJS.Response> {
        try {
            const result = await this.context.labelRepository.create(args);

            return new CoreJS.JSONResponse(result);
        } catch (error) {
            switch (error.code) {
                case CoreJS.CoreErrorCode.Duplicate:
                    return new CoreJS.ErrorResponse(CoreJS.ResponseCode.Forbidden, '#_label_duplicate_name');

                default:
                    throw error;
            }
        }
    }
}
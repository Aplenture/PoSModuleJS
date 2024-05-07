/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import * as BackendJS from "backendjs";
import { exec } from "child_process";
import { Args as GlobalArgs, Context, Options } from "../../core";

export interface BackupArgs extends GlobalArgs {
    readonly user: string;
    readonly password: string;
    readonly database: string;
    readonly directory: string;
}

export class Backup extends BackendJS.Module.Command<Context, BackupArgs, Options> {
    public readonly description = "creates a database backup by mysqldump";
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.StringParameter("user", "database user"),
        new CoreJS.StringParameter("password", "database password", ""),
        new CoreJS.StringParameter("database", "database name"),
        new CoreJS.StringParameter("directory", "path where to store the backup files", "")
    );

    public async execute(args: BackupArgs): Promise<CoreJS.Response> {
        let command = "mysqldump";

        command += " -u" + args.user;

        if (args.password)
            command += " -p" + args.password;

        command += " " + args.database;
        command += ` > ${process.cwd()}/${args.directory}${CoreJS.formatDate("YYYY-MM-DD")}.sql`;

        exec(command, (error, stdout, stderr) => {
            if (error)
                this.message(error.stack);

            if (stderr)
                this.message(error.stack);
        });

        return new CoreJS.OKResponse();
    }
}
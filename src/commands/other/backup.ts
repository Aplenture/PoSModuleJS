/**
 * Aplenture/BackendJS
 * https://github.com/Aplenture/BackendJS
 * Copyright (c) 2023 Aplenture
 * MIT License https://github.com/Aplenture/BackendJS/blob/main/LICENSE
 */

import * as CoreJS from "corejs";
import * as BackendJS from "backendjs";
import * as FTP from "basic-ftp";
import * as Stream from "stream";
import { spawn } from "child_process";
import { Args as GlobalArgs, Context, Options } from "../../core";

export interface BackupArgs extends GlobalArgs {
    readonly ftp_host: string;
    readonly ftp_user: string;
    readonly ftp_password: string;
    readonly ftp_path: string;
    readonly db_user: string;
    readonly db_database: string;
    readonly gpg_password: string;
}

export class Backup extends BackendJS.Module.Command<Context, BackupArgs, Options> {
    public readonly description = "creates a database backup and sends it to the ftp server encrypted by gpg256";
    public readonly parameters = new CoreJS.ParameterList(
        new CoreJS.StringParameter("ftp_host", "host of ftp server"),
        new CoreJS.StringParameter("ftp_user", "user of ftp server"),
        new CoreJS.StringParameter("ftp_password", "password of ftp server"),
        new CoreJS.StringParameter("ftp_path", "path where to store the backup files", "/"),
        new CoreJS.StringParameter("db_user", "user of database"),
        new CoreJS.StringParameter("db_database", "name of database"),
        new CoreJS.StringParameter("gpg_password", "password for gpg encryption")
    );

    private readonly client = new FTP.Client();

    public async execute(args: BackupArgs): Promise<CoreJS.Response> {
        await this.client.access({
            host: args.ftp_host,
            user: args.ftp_user,
            password: args.ftp_password,
            secure: true
        });

        await new Promise((resolve, reject) => {
            const stream = new Stream.Readable();
            stream._read = () => { }; // redundant? see update below

            this.client.uploadFrom(stream, `${args.ftp_path}${CoreJS.formatDate("YYYY-MM-DD")}.sql.aes-256-cbc`)
                .then(resolve)
                .catch(reject);

            const dump = spawn(`mysqldump`, ['-u' + args.db_user, args.db_database]);
            const encryption = spawn(`openssl`, ['aes-256-cbc', '-a', '-salt', '-pass', 'pass:' + args.gpg_password]);

            dump.stdout.pipe(encryption.stdin);

            encryption.on('error', reject);
            encryption.stdout.on('data', data => stream.push(data));
            encryption.stdout.on('end', () => stream.push(null));
            encryption.stderr.on('data', data => this.message('Backup >> ' + data));
            encryption.stderr.on('data', data => process.stdout.write('Backup >> ' + data + "\n"));
        });

        this.client.close();

        return new CoreJS.OKResponse();
    }
}
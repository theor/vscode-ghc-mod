/* --------------------------------------------------------------------------------------------
 * Copyright (c) Cody Hoover. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as path from 'path';
import { ExtensionContext, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';
import { Commands } from './commands';
import { Logger } from './utils/logger'

export function activate(context: ExtensionContext) {
    setLogLevel();
    workspace.onDidChangeConfiguration(setLogLevel); 

    // The server is implemented in node
    let serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));
    // The debug options for the server
    let debugOptions = { execArgv: ['--nolazy', '--debug=6004'] };

    // If the extension is launch in debug mode the debug server options are use
    // Otherwise the run options are used
    let serverOptions: ServerOptions = {
        run : { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: ['haskell'],
        synchronize: {
            // Synchronize the setting section 'ghcMod' to the server
            configurationSection: 'haskell.ghcMod'
        }
    };

    // Create the language client and start the client.
    let languageClient = new LanguageClient('ghc-mod server', serverOptions, clientOptions);
    let disposable = languageClient.start();

    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
    Commands.register(context, languageClient);
}

function setLogLevel() {
    let config = workspace.getConfiguration('haskell.ghcMod');
    let logLevel = config.get('logLevel', 'error');
    Logger.setLogLevel(Logger.LogLevel[logLevel]);
}

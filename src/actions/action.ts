import type { API } from 'vk-io';

export interface IActionCanRunOptions {
    archivePath: string;
    archiveFolders: string[];

    api: API;
}

export interface IActionHandlerOptions {
    archivePath: string;
    archiveFolders: string[];

    api: API;
}

export interface IAction {
    value: string;

    name: string;
    description: string;

    canRun(options: IActionCanRunOptions): Promise<boolean>;

    handler(options: IActionHandlerOptions): Promise<void>;
}

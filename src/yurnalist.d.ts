// eslint-disable-next-line max-classes-per-file
declare module 'yurnalist' {
	type Stdout = NodeJS.WriteStream;
	type Stdin = NodeJS.ReadStream;
	type TimeoutID = NodeJS.Timeout;

	export type InquirerPromptTypes = 'list' | 'rawlist' | 'expand' | 'checkbox' | 'confirm' | 'input' | 'password' | 'editor';
	export type PromptOptions = {
		name?: string;
		type?: InquirerPromptTypes;
		validate?: (input: string | Array<string>) => boolean | string;
	};

	class ProgressBar {
		constructor(total: number, stdout: Stdout | undefined, callback: ((progressBar: ProgressBar) => void) | null | undefined);

		stdout: Stdout;

		curr: number;

		total: number;

		width: number;

		chars: [string, string];

		delay: number;

		id: TimeoutID | null | undefined;

		static bars: string[][];

		tick(): void;

		cancelTick(): void;

		stop(): void;

		render(): void;
	}

	export class BaseReporter {

	}

	export type InquirerPromptTypes = 'list' | 'rawlist' | 'expand' | 'checkbox' | 'confirm' | 'input' | 'password' | 'editor';
	export type PromptOptions = {
		name?: string;
		type?: InquirerPromptTypes;
		validate?: (input: string | Array<string>) => boolean | string;
	};
	export type ReporterSelectOption = {
		name: string;
		value: string;
	};
	export type ReporterSetReporterSetSpinner = {
		clear: () => void;
		setPrefix: (current: number, prefix: string) => void;
		tick: (msg: string) => void;
		end: () => void;
	};
	export type ReporterSetReporterSetSpinnerSet = {
		ReporterSetSpinners: Array<ReporterSetReporterSetSpinner>;
		end: () => void;
	};
	export type QuestionOptions = {
		password?: boolean;
		required?: boolean;
	};
	export type Tree = {
		name: string;
		children?: Trees;
		hint?: string | null | undefined;
		hidden?: boolean;
		color?: string | null | undefined;
	};
	export type Trees = Array<Tree>;
	export type Package = {
		name: string;
		version: string;
	};

	export type Row = Array<string>;

	export type FormatKeys = 'bold' | 'dim' | 'italic' | 'underline' | 'inverse' | 'strikethrough' | 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray' | 'grey' | 'stripColor';

	class BaseReporter {}

	export class ConsoleReporter extends BaseReporter {
		constructor(opts: Record<string, any>);

		_lastCategorySize: number;

		_progressBar: ProgressBar | null | undefined;

		_ReporterSetSpinners: Set<ReporterSetSpinner>;

		_prependEmoji(msg: string, emoji: string | null | undefined): string;

		_logCategory(category: string, color: FormatKeys, msg: string): void;

		_verbose(msg: string): void;

		_verboseInspect(obj: any): void;

		close(): void;

		table(head: Array<string>, body: Array<Row>): void;

		step(current: number, total: number, msg: string, emoji?: string): void;

		inspect(value: unknown): void;

		list(title: string, items: Array<string>, hints?: Record<string, any>): void;

		header(command: string, pkg: Package): void;

		footer(showPeakMemory?: boolean): void;

		log(msg: string, { force }?: {
			force?: boolean;
		}): void;

		_log(msg: string, { force }?: {
			force?: boolean;
		}): void;

		success(msg: string): void;

		error(msg: string): void;

		info(msg: string): void;

		command(command: string): void;

		warn(msg: string): void;

		question(question: string, options?: QuestionOptions): Promise<string>;

		tree(key: string, trees: Trees, { force }?: {
			force?: boolean;
		}): void;

		activitySet(total: number, workers: number): ReporterSetReporterSetSpinnerSet;

		activity(): ReporterSetReporterSetSpinner;

		select(header: string, question: string, options: Array<ReporterSelectOption>): Promise<string>;

		progress(count: number): () => void;

		stopProgress(): void;

		prompt<T>(message: string, choices: Array<any>, options?: PromptOptions): Promise<Array<T>>;
	}

	type ReporterOptions = {
		verbose?: boolean;
		stdout?: Stdout;
		stderr?: Stdout;
		stdin?: Stdin;
		emoji?: boolean;
		noProgress?: boolean;
		silent?: boolean;
		nonInteractive?: boolean;
		peekMemoryCounter?: boolean;
	};

	export const createReporter: (options: ReporterOptions) => ConsoleReporter;

	const reporter: ConsoleReporter;

	export default reporter;
};

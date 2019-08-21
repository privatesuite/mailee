declare module "mailee_plugin" {

	const smtp: import("../src/smtp");
	const database = (await import("../src/db")).default;

	namespace utils {

		const log = (await import("../src/utils/log")).default;
		const conf = (await import("../src/utils/conf")).default;

	}

	namespace constants {

		const basePath: string;
		const configPath: string;

	}

}

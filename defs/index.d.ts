declare module "mailee" {

	const smtp: import("../src/smtp");
	const database = (await import("../src/db")).default;

	namespace utils {

		const conf = (await import("../src/utils/conf")).default;

	}

}

interface Status { code: number, message: string }

export default {
	NO_DATA: { code: -1, message: "No test data available.<br>Please generate new tests." } as Status,
	IDLE: { code: 0, message: null } as Status,
	READY: { code: 1, message: null } as Status,
	COMPLETE: { code: 2, message: null } as Status,
	RETREIVING_ID: { code: 10, message: "Fetching ID for site." } as Status,
	GENERATING_ID: { code: 11, message: "Creating ID for site." } as Status,
	FETCH_INFO: { code: 12, message: "Fetching test data." } as Status,
	ZIP_TESTS: { code: 13, message: "Creating archive of tests." } as Status,
	POST_TESTS: { code: 14, message: "Sending tests to server." } as Status,
	EXTRACTING: { code: 15, message: "Extracting tests." } as Status,
	TESTING: { code: 20, message: "Running tests." } as Status,
}
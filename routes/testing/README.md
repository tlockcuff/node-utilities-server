# MoJo Testing Framework

## Release 1

- MarketCarpenter contains a /test/ folder in root. All *.spec.(ts|js) files are considered tests for the site.
- NPM/Node testing suite is not contained on MC, the files are shipped over to the node server for evaluation.
- A JSON reporter is return containing the tests.
- Handler hits the testing server and returns the results.

## Release 2

- Testing folders can now contain sub folders.
    - Sub folders are grouped as modules.
- Other reporters like HTML and PDF wil be available.
- Admin UI for testing
    - Run tests.
    - View testing modules.
    - View test results in human-readable format.

## Release 3

- Allows developers to select which tests are run and group them into packages.
- Packages can return a pass or fail.
    - Hard fail means the build breaks.
    - Soft fail is a warning to the developer.
- Mark packages as critical to the build process.
- Hook into VSTS and interrupt the build process if critical modules fail.

## Release 4

- Failed tests return screenshots.
- Tests can be set up to run at specific times.
- Tests are written in a familiar environment for developers.
    - Tests do not require knowledge of Mocha or Puppeteer libraries.
    - Tests can be written in plain JQuery and Underscore and are evaluated during the test.
- Advanced UI including history, screenshots, testing and build data in real-time.
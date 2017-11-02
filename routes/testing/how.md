# v1

POST to /test with zipped test files
    generates a UUID
    responds with a UUID that's used to send the socket a message

IO messages
    << "test" { uuid }
        extracts the test and spawns mocha to begin testing it.
        >> "status" message: String
            posts the current status of the test.
        >> "result" data: JSONString
            posts the ran test data.
        >> "done" tests_failed: Number
            posts the number of tests failed.

# v2

POST to /test with zipped test files
    generates a UUID
    Stores the UUID as a structure { UUID, LastRan: Date, Failed: Number, Results: JSON[] }
    responds with a UUID that's used to send the socket a message

IO messages
    << "test" { uuid }
        Checks to see if the test was already extracted.
        Spawns mocha and runs the existing or newly extracted test data.
        >> "status" message: String
            posts the current status of the test.
        >> "result" data: JSONString
            posts the ran test data.
        >> "done" tests_failed: Number
            posts the number of tests failed.
    << "info" { uuid }
        requests info on a run test.
    >> "info" { UUID, LastRan: Date, Failed: Number, Results: JSON[] }
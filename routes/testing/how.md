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


# Posting to a server
    Server gets and ID and a zipfile.
    The server will store the zip and extract the zip to a folder, overwriting the entire folder
    The server will return a READY signal.
# Get info from server
    Socket gets a 'testing' call with the project ID.
    Server looks for the folder and zip file.
        If it finds the folder:
            it checks to find the meta.json inside and returns the data inside.
            otherwise it sends back a READY signal.
        Otherwise:
            it returns a NO_DATA signal

# Socket starts tests
    Socket gets ID
    Server checks to see if Folder exists with the ID
        if not, it checks to see if the zip exists.
            if not, it throws a NO_DATA signal
        if so, the server runs the testing command
        the server pipes the results to the socket stream
        the server keeps a record of each pass and fail
        at the end of the stream, the server stores the info in a meta.json contained in the project test folder.
        Server returns a COMPLETED signal.
            
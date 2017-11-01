POST to /test with zipped test files
    generates a UUID
    unzips the folder and names it the UUID
    responds with a UUID that's used to send the socket a message
    UUID is stored in memory
        { UUID, Status, Results }

IO messages
    << "start", {uuid}
        begins a test and streams the JSON response back.
    >> "data", {uuid, result}
    << "info", {uuid}
        returns info about the test results or status.
    >> "finished", {uuid}
import * as SocketIO from "socket.io"
import { Server } from "http"

interface IRooms {
    TestingSuite: SocketIO.Namespace
}


export default new class {
    public io: SocketIO.Server;
    public rooms: IRooms;


    public Setup(app: Server) {
        this.io = SocketIO(app);

        this.rooms = {
            TestingSuite: this.io.of('/test-suite')
        }
    }
}
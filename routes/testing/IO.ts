import { Server } from 'http';

export default new class {
    public io;
    public Setup(app: Server) {
        this.io = require('socket.io')(app)
    }
}
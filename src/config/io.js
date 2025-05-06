
// const connectRedis = async () => {
//   const client = redis.createClient(
//     {
//       port: 6379,
//       host: 'localhost'
//     }
//   )
//   client.connect()
//   return client
// }
module.exports = async (app, http, appConfig) => {
  app.io = require('socket.io')(http);
  const redis = require('socket.io-redis');
  app.io.adapter(redis(appConfig.redisDB));
  const Redis = require('redis');
  // var pub = Redis.createClient(appConfig.redisDB);
  const pub = Redis.createClient(
    {
      port: 6379,
      host: 'localhost'
    }
  )
  // await pub.connect()
  const sub = Redis.createClient(
    {
      port: 6379,
      host: 'localhost'
    }
  )
  // await sub.connect()


  const socketListeners = {};
  app.io.addSocketListener = (name, listener) => socketListeners[name] = listener;
  app.io.addSocketListener('someListener', (socket) => { });

  app.io.getSessionUser = socket => {
    const sessionUser = socket.request.session ? socket.request.session.user : null;
    if (sessionUser) {
      delete sessionUser.password;
      delete sessionUser.token;
      delete sessionUser.tokenDate;
    }
    return sessionUser;
  };

  const joinSystem = socket => {
    // Leave all rooms except default room
    const rooms = Array.from(socket.rooms).slice(1);
    rooms.forEach(room => socket.leave(room));

    // Join with room of current user email
    const sessionUser = app.io.getSessionUser(socket);
    sessionUser && socket.join(sessionUser.email.toString());

    // Remove all listener
    const eventNames = socket.eventNames().filter(event => !['disconnect', 'system:join'].includes(event));
    eventNames.forEach(event => socket.removeAllListeners(event));

    // Run all socketListeners
    Object.values(socketListeners).forEach(socketListener => socketListener(socket));
  };

  app.io.on('connection', socket => {
    sub.on("message", function (channel, data) {
      data = JSON.parse(data);
      console.log("Inside Redis_Sub: data from channel " + channel + ": ");
      // if (parseInt("sendToSelf".localeCompare(data.sendType)) === 0) {
      //   io.emit(data.method, data.data);
      // } else if (parseInt("sendToAllConnectedClients".localeCompare(data.sendType)) === 0) {
      //   io.sockets.emit(data.method, data.data);
      // } else if (parseInt("sendToAllClientsInRoom".localeCompare(data.sendType)) === 0) {
      //   io.sockets.in(channel).emit(data.method, data.data);
      // }
    });
    app.isDebug && console.log(` - Socket ID ${socket.id} connected!`);
    app.isDebug && socket.on('disconnect', () => {
      console.log(` - Socket ID ${socket.id} disconnected!`)
      // sub.quit();
    });
    console.log(` - Socket ID ${socket.id} connected!`);
    socket.on('disconnect', () => console.log(` - Socket ID ${socket.id} disconnected!`));
    socket.on('system:join', () => joinSystem(socket));
    // joinSystem(socket);
    console.log("Socket connected with socket id -> ", socket.id)
    sub.on('subscribe', (channel) => {
      console.log("Subscribed to " + channel + ".");
    });
    socket.on('join', (data) => {
      console.log('userSocket.on -> "join" -> room -> room', data);
      var reply = JSON.stringify({
        method: 'message',
        sendType: 'sendToSelf',
        data: "Share this room name with others to Join:" + data.room
      });
      pub.publish('1', reply)
      sub.subscribe('1');
      socket.join(data.room);
      app.io.to('1').emit("send_message_sendback", { room: data.room, data: data });
    }),

      socket.on('leave', (data) => {
        console.log('userSocket.on -> "join" -> room -> room', data);
        // sub.subscribe('1');
        socket.leave(data.room);
        app.io.to('1').emit("send_message_sendback", { room: data.room, data: data });
      }),
      socket.on("send_message", (data) => {
        console.log('userSocket.on -> "send_message" -> data -> ', data)
        // socket.broadcast.emit("receive_message", data)
        socket.emit(
          'send_message_sendback',
          {
            // message: "CALLBACK FROM SERVER",
            message: data,
          }
        );
      })
  });

  if (app.isDebug) {
    app.fs.watch('public/js', () => { // (eventType, filename)
      console.log('Reload client!');
      app.io.emit('debug', 'reload');
    });
  }
};
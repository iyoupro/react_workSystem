var Koa = require('koa');
var app = new Koa();
const fs = require('fs');
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

const userSocket = {}; 

// socket连接

io.on("connection", function(socket){
    socket.on('new user', (userKey) => {
        if(!(userKey in userSocket)){
            socket.userKey = userKey;
            userSocket[userKey] = socket;
        }
    })

    socket.on('send message', (prop) => {
        if(prop.group == 'private'){
            fs.readFile('./data/allPrivateChatsData.json', function (err, data) {
                if(err){
                    return console.error(err);
                }
                let parson = data.toString();
                parson = JSON.parse(parson);
                chatDataIndex = prop.curChatKey < prop.message.user ? prop.curChatKey : prop.message.user;
                chatDataIndex += '-'
                chatDataIndex += prop.curChatKey > prop.message.user ? prop.curChatKey : prop.message.user;
                parson[chatDataIndex].push(prop.message);
                let updateJson = JSON.stringify(parson);
                fs.writeFile('./data/allPrivateChatsData.json',updateJson,function(err){
                    if(err){
                        console.error(err);
                    }
                })
            })
            if(prop.message.key in userSocket)
                io.sockets.socket(userSocket[prop.curChatKey]).emit('receive message', { group: prop.group, key: prop.curChatKey, message: prop.message })

        }
        else{
            fs.readFile('./data/allGroup1ChatsData.json', function (err, data) {
                if(err){
                    return console.error(err);
                }
                let parson = data.toString();
                parson = JSON.parse(parson);
                chatDataIndex = prop.curChatKey;
                parson[chatDataIndex].push(prop.message);
                let updateJson = JSON.stringify(parson);
                fs.writeFile('./data/allGroup1ChatsData.json', updateJson, function(err){
                    if(err){
                        console.error(err);
                    }
                })
            })
            fs.readFile('./data/allGroup1Chats.json', function (err, data) {
                if(err){
                    return console.error(err);
                }
                let parson = data.toString();
                parson = JSON.parse(parson);
                for (let groupKey in parson[prop.curChatKey][key]){
                    if(groupKey in userSocket){
                        io.sockets.socket(userSocket[groupKey]).emit('receive message', { group: prop.group, key: prop.curChatKey, message: prop.message })
                    }
                }
            })
        }
    })

    socket.on('disconnect', function() {
        if(socket.userKey in userSocket){
            delete(userSocket[socket.userKey]);
        }
    })

})
 
 
// 监听端口
server.listen(8081, () => {
  console.log('listening on *:8081');
});
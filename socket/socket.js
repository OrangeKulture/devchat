module.exports = (io, rooms) => {
    let chatrooms = io.of('/roomlist').on('connection', (socket) => {
        socket.emit('roomupdate', JSON.stringify(rooms));

        socket.on('newroom', function(data) {
            rooms.push(data);
            socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
            socket.emit('roomupdate', JSON.stringify(rooms));
            alert('something');
        })
    })

    let messages = io.of('/messages').on('connection', (socket) => {

        socket.on('joinroom', (data) => {
            socket.username = data.user;
            socket.userPic = data.userPic;
            socket.join(data.room);
            updateUserList(data.room, true);
        })

        socket.on('newMessage', (data) => {
            socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
        })

        function updateUserList(room, updateAll){
            let getUsers = io.of('/messages').clients(room);
            let userList = [];
            for(i in getUsers){
                userList.push({user: getUsers[i].username, userPic: getUsers[i].userPic});
            }
            socket.to(room).emit('updateUsersList', JSON.stringify(userList));

            if(updateAll){
                socket.broadcast.to(room).emit('updateUsersList', JSON.stringify(userList));
            }
        }

        socket.on('updateList', (data) => {
            updateUserList(data.room);
        })

    })
}
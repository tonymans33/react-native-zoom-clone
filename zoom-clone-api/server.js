const express = require('express')
const { Socket } = require('socket.io')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

const port = 3011

app.get('/', (req, res) => {
    res.send("heyoo")
})

const users = []
const addUser = (userName, roomId) => {
    users.push({userName: userName, roomId: roomId})
}

const getRoomUsers = (roomId) => {
    return users.filter(user => (user.roomId == roomId))
}

const userLeave = (userName) => {
    users = users.filter(user => user.userName != userName)
}

io.on("connection", socket => {
    console.log("someone connected !!")
    socket.on("join-room", ({ roomId, userName }) => {
        console.log("user joined room")
        console.log(roomId)
        console.log(userName)
        socket.join(roomId)
        addUser(userName, roomId)
        socket.to(roomId).emit('user-connected', userName)
        io.to(roomId).emit('all-users', getRoomUsers(roomId))

        socket.on('disconnect', () => {
            console.log("disconnected")
            socket.leave(roomId)
            userLeave(userName)
            io.to(roomId).emit("all-users", getRoomUsers(roomId))
        })
    })
})  


server.listen(port, () => {
    console.log(`Zoom clone api is running on port: ${port}`)
})

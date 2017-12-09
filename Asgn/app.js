var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var bodyParser = require('body-parser');
var app = express();

var uuid = require('uuid-v4'); 

var common = require('./common');
var database = require('./database');
database.connect();

var request = require('request');
var async = require('async');

var session = require('express-session');
var cookieParser = require('cookie-parser');

var bcrypt   = require('bcrypt-nodejs');

var path = require('path');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var flash = require('connect-flash');

var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Colombo");
global.colombo = moment;
global.datetime_format = "YYYY-MM-DD HH:mm:ss";


app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(express.logger('dev'));
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: function(str, path) {
      return stylus(str).set('filename', path).use(nib())
    }
  } 
));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 3600000 }, secret: 'vvvvvvtestkey'}));
app.use(flash());
app.use(fileUpload());

var http = require('http').Server(app);
var io = require('socket.io')(http); 


global.appname = "Chat App";

global.setupMessageAlert = function(req,type,msg){
    req.flash(type, msg);
};

global.getMessageAlerts = function(req,type){
    var messages = req.flash(type);
    return messages;
};

global.random = function(){
    return Math.floor(Math.random()*89999+10000);
};


app.get('/', function(req, res) { 
    var data = {title: 'Chat',req: req};
    res.render('pages/index', data);
});

app.post('/message/image/upload', function(req, res) {
    if (!req.files)
    return res.status(400).send('No files were uploaded.');
     
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let file = req.files.file;
    console.log(file);
    var ext = 'png';
    if(file.mimetype == 'image/png'){
        ext = 'png';
    }else if(file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg'){
        ext = 'jpg';
    }else{
        return res.status(400).send('Invalid file type.');
    }
    var uid = req.body.uid;
    var gid = req.body.gid;
            console.log("xc "+uid);

    
    var filename = uuid()+'.'+ext;

    var pic_active = 1;
    var date = moment().format("YYYY-MM-DD");
    var dir = 'uploads/'+date;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    var pic_path_mv = dir+'/'+filename;
    file.mv(pic_path_mv, function(err) {
        if (err)
            return res.status(500).send(err);
         
        database.getUserById(uid,function(usr){
            if(usr != null){
                database.createMessage(uid,gid,pic_path_mv,'image',function(mid){
                    database.getGroupUsers(gid,function(users){
                        for (var i = 0; i < users.length; i++) {
                            var item = users[i];
                            if (io.sockets.connected[item.user.socket_id]) {
                                var msg = {mid:mid,uid: uid,message: pic_path_mv,name: usr.name,type:'image',created_at: moment().tz("Asia/Colombo").format('YYYY-MM-DD HH:mm:ss')};
                                io.sockets.connected[item.user.socket_id].emit('send_message_broadcast', msg);
                            }
                        }

                        res.send('File is successfully uploaded!');

                    });
                });
            }
        });

    });

});

app.get('/view', function (req, res) {
    var file = req.query.path;
    console.log(file+" d");
    if (!fs.existsSync(file)){
        file = 'uploads/logo.png';
        res.sendfile(path.resolve(path.resolve(file)));
    }else{
        res.sendfile(path.resolve(path.resolve(file)));
    }

});

io.on('connection', function(socket){ 
    console.log('user connected '+socket.handshake.query.uid);

    database.updateUser(socket.handshake.query.uid,socket.id,function(data){

    });

    socket.on('get_public_group_list', function(data){
        console.log("data.uid "+data.uid);
        database.getPublicGroups(function(groups){
            database.getPrivateGroups(data.uid,function(pvgroups){
                for (var i = 0; i < pvgroups.length; i++) {
                   groups.push(pvgroups[i]);
                }
                socket.emit('get_public_group_list',{ data : groups});
            });
        });
    });

    socket.on('get_group_chat_by_gid', function(data){
        database.getGroupMessages(data.gid,function(messages){
            console.log("sd");
            console.log(messages.length);
            database.createGroupUser(data.uid,data.gid);
            socket.emit('get_group_chat_by_gid',{ data : messages});
        });
    });

    socket.on('private_message', function(data){
            console.log("private_message "+data.uid+" "+data.ruid);
        database.createPrivateGroup(data.uid,data.ruid,function(gid){
            if(gid != -1){
                database.getPublicGroups(function(groups){

                    database.getPrivateGroups(data.uid,function(pvgroups){
                        for (var i = 0; i < pvgroups.length; i++) {
                           groups.push(pvgroups[i]);
                        }

                        database.getGroupUsers(gid,function(users){
                            for (var i = 0; i < users.length; i++) {
                                var item = users[i];
                                if (io.sockets.connected[item.user.socket_id]) {
                                    io.sockets.connected[item.user.socket_id].emit('get_public_group_list', { data : groups});
                                }
                            }
                        });

                    });
                });
            }
        });
    });

    socket.on('create_group', function(data){
            console.log("create_group");
        database.getUserById(data.uid,function(usr){
            if(usr != null){
                database.createGroup(data.uid,data.group,function(gid){
                    database.getPublicGroups(function(groups){

                        database.getPrivateGroups(data.uid,function(pvgroups){
                            for (var i = 0; i < pvgroups.length; i++) {
                               groups.push(pvgroups[i]);
                            }
                            database.createGroupUser(data.uid,gid);
                            socket.emit('get_public_group_list',{ data : groups});
                        });

                    });
                });
            }
        });
    });

    socket.on('send_message', function(data){
            console.log("send_message");
        database.getUserById(data.uid,function(usr){
            if(usr != null){
                database.createMessage(data.uid,data.gid,data.message,data.type,function(mid){
                    database.getGroupUsers(data.gid,function(users){
                        console.log("users "+users.length)
                        for (var i = 0; i < users.length; i++) {
                            var item = users[i];
                            if (io.sockets.connected[item.user.socket_id]) {
                                var msg = {mid:mid,uid: data.uid,message: data.message,type:'text',name: usr.name,created_at: moment().tz("Asia/Colombo").format('YYYY-MM-DD HH:mm:ss')};
                                io.sockets.connected[item.user.socket_id].emit('send_message_broadcast', msg);
                            }
                        }
                    });
                });
            }
        });
    });

    socket.on('delete_message', function(data){
            console.log("delete_message");
        database.getUserById(data.uid,function(usr){
            if(usr != null){
                database.deleteMessage(data.uid,data.mid);
                database.getGroupUsers(data.gid,function(users){
                    console.log("users "+users.length)
                    for (var i = 0; i < users.length; i++) {
                        var item = users[i];
                        if (io.sockets.connected[item.user.socket_id]) {
                            var msg = {mid: data.mid};
                            io.sockets.connected[item.user.socket_id].emit('delete_message_broadcast', msg);
                        }
                    }
                });
            }
        });
    });

    socket.on('edit_message', function(data){
            console.log("edit_message");
        database.getUserById(data.uid,function(usr){
            if(usr != null){
                database.editMessage(data.uid,data.message,data.mid);
                database.getGroupUsers(data.gid,function(users){
                    console.log("users "+users.length)
                    for (var i = 0; i < users.length; i++) {
                        var item = users[i];
                        if (io.sockets.connected[item.user.socket_id]) {
                            var msg = {mid: data.mid,uid:data.uid,type:'text',message: data.message};
                            io.sockets.connected[item.user.socket_id].emit('edit_message_broadcast', msg);
                        }
                    }
                });
            }
        });
    });
    
    socket.on('login_user', function(data){
            console.log("login_user");
        database.createUser(data.name,socket.id,function(res){
            socket.emit('login_user',{ data : res});
        });
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(3333, function(){
  console.log('listening on *:3333');
});
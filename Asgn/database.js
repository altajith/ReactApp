const Sequelize = require('sequelize');
const sequelize = new Sequelize('asgn', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  port: 8889
});

const prefix = "asg_";

const User = sequelize.define(prefix+'users', {
        uid: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        name: Sequelize.STRING,
        socket_id: Sequelize.STRING,
        socket_connected: Sequelize.INTEGER,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
    },{
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }); 

const Group = sequelize.define(prefix+'groups', {
        gid: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        group_name: Sequelize.STRING,
        public_group: Sequelize.INTEGER,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
    },{
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }); 

const Message = sequelize.define(prefix+'messages', {
        mid: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        uid: Sequelize.INTEGER,
        gid: Sequelize.INTEGER,
        message: Sequelize.STRING,
        type: Sequelize.STRING,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
    },{
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }); 
Message.belongsTo(User, {foreignKey : 'uid', as: 'user'});
Group.belongsTo(Group, {foreignKey : 'gid', as: 'group'});


const GroupUser = sequelize.define(prefix+'group_users', {
        gid: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        uid: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
    },{
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }); 
GroupUser.belongsTo(Group, {foreignKey : 'gid', as: 'group'});
GroupUser.belongsTo(User, {foreignKey : 'uid', as: 'user'});

module.exports = {
   connect: function () {
    console.info("DB : Connected");
    return sequelize;
  },
  editMessage: function(uid,msg,mid) {
    Message.findOne({ where: {uid: uid,mid: mid} }).then(message => {
      if(message != null){
          message.update({ message: msg}, {fields: ['message']}).then(() => {
          });
      }
    });
  },
  deleteMessage: function(uid,mid) {
    Message.findOne({ where: {uid: uid,mid: mid} }).then(message => {
      if(message != null){
        message.destroy({ force: true });
      }
    });
  },
  updateUser: function(uid,socket_id,callback) {
    User.findOne({ where: {uid: uid} }).then(user => {
        if(user != null){
          user.update({ socket_id: socket_id,socket_connected: 1}, {fields: ['socket_id','socket_connected']}).then(() => {
          });
        }
    });
  },
  getUserById: function(uid,callback) {
    User.findOne({ where: {uid: uid} }).then(user => {
        if(user != null){
          callback(user);
        }else{
          callback(null);
        }
    });
  },
  createUser: function(name,socket_id,callback) {
    User.findOne({ where: {name: name} }).then(user => {
        if(user == null){
          User.create({ name: name,socket_id: socket_id,socket_connected: 1}).then(usr => {
            console.log(usr);
            var usr = usr.null;
            callback({res: true, usr: usr});
          });
        }else{
          user.update({ socket_id: socket_id,socket_connected: 1}, {fields: ['socket_id','socket_connected']}).then(() => {
            callback({res: true, usr: user.uid});
          });
        }
    });
  },
  createMessage: function(uid,gid,message,type,callback) {
    Message.create({ uid: uid,gid: gid,message: message,type: type}).then(message => {
      callback(message.null);
    });
  },
  createGroup: function(uid,group_name,callback) {
    Group.create({ uid: uid,group_name: group_name}).then(grp => {
      callback(grp.null);
    });
  },
  createPrivateGroup: function(uid,ruid,callback) {
    User.findOne({ where: {uid: ruid} }).then(user => {
        if(user != null){
          User.findOne({ where: {uid: uid} }).then(user_two => {
            if(user_two != null){
              var group_name = user.name+"-"+user_two.name;
              Group.findOne({ where: {group_name: group_name} }).then(grp => {
                if(grp == null){
                  Group.create({ group_name: group_name,public_group: 0}).then(grp => {
                    var gid = grp.null;
                    GroupUser.create({ gid: gid,uid: uid});
                    GroupUser.create({ gid: gid,uid: ruid});
                    callback(gid);
                  });
                }else{
                    callback(grp.gid);
                }
              });
            }else{
              callback(-1);
            }
          });
        }else{
            callback(-1);
        }
    });
  },
  createGroupUser: function(uid,gid) {
    GroupUser.findOne({ where: {gid: gid, uid: uid} }).then(user => {
        if(user == null){
          GroupUser.create({ gid: gid,uid: uid});
        }
    });
  },
  getPrivateGroups: function(uid,callback) {
    sequelize.query("SELECT * FROM "+prefix+"groups g WHERE g.public_group = 0 AND g.gid IN (SELECT u.gid FROM "+prefix+"group_users u WHERE u.uid = :uid) ORDER BY g.group_name", { replacements: { uid: uid },type: sequelize.QueryTypes.SELECT})
    .then(groups => {
        if(groups != null){
            callback(groups,true);
        }else{
            callback(null,false);
        }
    });
  },
  getPublicGroups: function(callback) {
    Group.findAll({ where: { public_group: 1},order: [['group_name']]}).then(groups => {
        if(groups != null){
            callback(groups,true);
        }else{
            callback(null,false);
        }
    });
  },
  getGroupUsers: function(gid,callback) {
    GroupUser.findAll({ 
      where: { gid: gid},
      include: [{
                    model: User,
                    as: 'user'
                }]
    }).then(users => {
        if(users != null){
            callback(users);
        }else{
            callback(null);
        }
    });
  },
  getGroupMessages: function(gid,callback) {
    Message.findAll({ 
      where: { gid: gid},
      include: [{
                    model: User,
                    as: 'user'
                }]
    }).then(messages => {
        if(messages != null){
            callback(messages,true);
        }else{
            callback(null,false);
        }
    });
  },
  /*
  validateUser: function(uid,token,socket_id,callback) {
    User.findOne({ where: {user_no: uid,user_auth_token: token} }).then(garage => {
        if(garage != null){
            garage.update({ user_socket_id: socket_id,user_socket_disconected: 1}, {fields: ['user_socket_id','user_socket_disconected']}).then(() => {
                callback(true);
            });
        }else{
            callback(false);
        }
    });
  },
  validateGarage: function(gid,token,socket_id,callback) {
    Garage.findOne({ where: {garage_no: gid,garage_auth_token: token} }).then(garage => {
        if(garage != null){
            garage.update({ garage_socket_id: socket_id,socket_disconected: 1}, {fields: ['garage_socket_id','socket_disconected']}).then(() => {
                callback(true);
            });
        }else{
            callback(false);
        }
    });
  },
  updateLocationGarage: function(gid,token,lat,lon,direct,req_no,req_status,callback) {
    Garage.findOne({ where: {garage_no: gid,garage_auth_token: token} }).then(garage => {
        if(garage != null){
            garage.update({ g_lat: lat, g_lon: lon,direct: direct}, {fields: ['g_lat','g_lon','direct']}).then(() => {
                RiderTrackerObj.create({ rlt_lat: lat,rlt_lon: lon,rlt_rider_no: gid,rlt_req_status: req_status,rlt_req_no: req_no});
                callback(true);
            });
        }else{
            callback(false);
        }
    });
  },
  disconectGarage: function(gid,token,callback) {
    Garage.findOne({ where: {garage_no: gid,garage_auth_token: token} }).then(garage => {
        if(garage != null){
            garage.update({socket_disconected: 0}, {fields: ['socket_disconected']}).then(() => {
                callback(true);
            });
        }else{
            callback(false);
        }
    });
  },
  getNewRequests: function(callback) {
    sequelize.query("SELECT r.eta,r.rate,r.time,r.cal_fee,"+car_info_sql+",s.sev_image_url,r.accept_deadline_datetime,r.req_no,r.created_lat,r.created_lon,r.created_location_in_text,r.req_type,r.req_status,r.user_no,r.created_at,r.req_status,r.payment_done,s.sev_name,u.user_first_name,u.user_last_name,u.user_phone,u.user_profile_pic,u.user_socket_id FROM sym_requests r,sym_services s,sym_users u,sym_user_cars c WHERE c.user_no = r.user_no AND r.req_type = s.sev_no AND s.sev_active = 1 AND r.user_no = u.user_no AND r.rider_no = 0 AND r.rider_type = 'garage' AND r.req_type != 0 AND r.req_status = 1", { type: sequelize.QueryTypes.SELECT})
    .then(reqs => {
        if(reqs.length != 0){
            callback(reqs,true);
        }else{
            callback(null,false);
        }
    });
  },
  getLiveGarages: function(rt,lat,lon,callback) {
	var distSql = "111.1111 * DEGREES(ACOS(COS(RADIANS("+lat+")) * COS(RADIANS(g.g_lat)) * COS(RADIANS("+lon+" - g.g_lon)) + SIN(RADIANS("+lat+")) * SIN(RADIANS(g.g_lat)))) AS distance_in_km"; 
	var multipleReqSql = "(SELECT COUNT(o.req_no) FROM sym_requests o WHERE o.rider_no = g.garage_no AND o.req_status IN (2,3,4,5) AND o.req_type != 0 AND o.rider_rating_done = 0 AND o.rider_type = 'garage' AND o.rider_rating_done = 0) AS odr_cnt";
    sequelize.query("SELECT g.garage_no,g.garage_socket_id,g.garage_first_name,g.garage_last_name,g.garage_phone,g.g_lat,g.g_lon,"+distSql+","+multipleReqSql+" FROM sym_garages g WHERE (g.garage_no IN (SELECT g1.garage_no FROM sym_garage_services g1 WHERE g1.garage_srv_status = 1 AND g1.srv_no = :req_type)) AND g.garage_busy = 0 AND g.garage_active = 1 HAVING distance_in_km < 11 AND odr_cnt = 0 ORDER BY distance_in_km LIMIT 5", { replacements: { req_type: rt },type: sequelize.QueryTypes.SELECT})
    .then(users => {
        if(users.length != 0){
            callback(users,true);
        }else{
            callback(null,false);
        }
    });
  },
  getLiveRequest: function(uid,callback) {
    sequelize.query("SELECT g.g_lat,g.g_lon,g.direct,g.garage_first_name,g.garage_last_name,g.garage_phone,g.garage_profile_pic,r.eta,r.rate,r.time,r.cal_fee,"+car_info_sql+",s.sev_image_url,r.accept_deadline_datetime,r.arrived_deadline_datetime,r.on_the_way_datetime,r.ontheway_deadline_datetime,r.accepted_datetime,r.req_no,g.garage_socket_id,r.rider_rating_done,r.created_lat,r.created_lon,r.created_location_in_text,r.req_type,r.req_status,r.user_no,r.created_at,r.req_status,r.payment_done,s.sev_name,u.user_first_name,u.user_last_name,u.user_phone,u.user_profile_pic,u.user_socket_id FROM sym_requests r,sym_services s,sym_users u,sym_garages g ,sym_user_cars c WHERE c.user_no = r.user_no AND s.sev_no = r.req_type AND s.sev_active = 1 AND u.user_no = r.user_no AND g.garage_no = r.rider_no AND r.rider_type = 'garage' AND r.req_status IN (2,3,4,5,6) AND r.req_type != 0 AND r.rider_rating_done = 0 AND r.rider_no = :rider_no LIMIT 1",{ replacements: { rider_no: uid },type: sequelize.QueryTypes.SELECT})
    .then(req => {
        if(req.length != 0){
            callback(req,true);
        }else{
            callback(null,false);
        }
    });
  },
  getLiveRequestById: function(gid,callback) {
    sequelize.query("SELECT g.g_lat,g.g_lon,g.direct,g.garage_first_name,g.garage_last_name,g.garage_phone,g.garage_profile_pic,r.eta,r.rate,r.time,r.cal_fee,"+car_info_sql+",s.sev_image_url,r.accept_deadline_datetime,r.arrived_deadline_datetime,r.on_the_way_datetime,r.ontheway_deadline_datetime,r.accepted_datetime,r.req_no,r.rider_no,g.garage_socket_id,r.rider_rating_done,r.created_lat,r.created_lon,r.created_location_in_text,r.req_type,r.req_status,r.user_no,r.created_at,r.req_status,r.payment_done,s.sev_name,u.user_first_name,u.user_last_name,u.user_phone,u.user_profile_pic,u.user_socket_id FROM sym_requests r,sym_services s,sym_users u,sym_garages g ,sym_user_cars c WHERE c.user_no = r.user_no AND s.sev_no = r.req_type AND s.sev_active = 1 AND u.user_no = r.user_no AND g.garage_no = r.rider_no AND r.rider_type = 'garage' AND r.req_type != 0 AND r.req_no = :req_no LIMIT 1",{ replacements: { req_no: gid },type: sequelize.QueryTypes.SELECT})
    .then(req => {
        if(req.length != 0){
            callback(req,true);
        }else{
            callback(null,false);
        }
    });
  },
  getLiveRequestByIdWithoutGarage: function(gid,callback) {
    sequelize.query("SELECT r.eta,r.rate,r.time,r.cal_fee,"+car_info_sql+",s.sev_image_url,r.accept_deadline_datetime,r.arrived_deadline_datetime,r.on_the_way_datetime,r.ontheway_deadline_datetime,r.accepted_datetime,r.req_no,r.rider_no,r.rider_rating_done,r.created_lat,r.created_lon,r.created_location_in_text,r.req_type,r.req_status,r.user_no,r.created_at,r.req_status,r.payment_done,s.sev_name,u.user_first_name,u.user_last_name,u.user_phone,u.user_profile_pic,u.user_socket_id FROM sym_requests r,sym_services s,sym_users u ,sym_user_cars c WHERE c.user_no = r.user_no AND s.sev_no = r.req_type AND s.sev_active = 1 AND u.user_no = r.user_no AND r.rider_type = 'garage' AND r.req_type != 0 AND r.req_no = :req_no LIMIT 1",{ replacements: { req_no: gid },type: sequelize.QueryTypes.SELECT})
    .then(req => {
        if(req.length != 0){
            callback(req,true);
        }else{
            callback(null,false);
        }
    });
  },
  getGarageById: function(gid,callback) {
    Garage.findOne({ where: {garage_no: gid} }).then(garage => {
        if(garage != null){
            callback(garage,true);
        }else{
            callback(null,false);
        }
    });
  },
  createRequestSent: function(rid,gid,sid,callback) {
    NewRequestFoundObj.findOne({ where: {rider_no: gid,req_id: rid} }).then(exists_req => {
        if(exists_req == null){
            NewRequestFoundObj.create({ socket_id: sid,req_id: rid,rider_no: gid});
        }
    });
  },
  findAllSentRequests: function(rid,callback) {
    sequelize.query("SELECT s.req_id,s.rider_no,g.garage_socket_id FROM sym_socket_sent_new_requests s,sym_garages g WHERE s.rider_no = g.garage_no AND s.req_id = :req_no",{ replacements: { req_no: rid },type: sequelize.QueryTypes.SELECT})
    .then(sent_reqs => {
        if(sent_reqs.length != 0){
            callback(sent_reqs,true);
        }else{
            callback(null,false);
        }
    });
  },
  createServerRequest: function(ref_id,ref_type,token,title,message,uid,ref_status,callback) {
    NewServerReqObj.findOne({ where: {ref_id: ref_id,uid: uid,ref_status:ref_status} }).then(exists_req => {
        if(exists_req == null){
            NewServerReqObj.create({ ref_id: ref_id,ref_type: ref_type,token: token,title: title,message: message,active: 1,uid: uid,ref_status:ref_status}).then(rr => {
                callback(rr,true);
            });
        }else{
            callback(null,false);
        }
    });
  },
  getNewsByUserId: function(gid,callback) {
    sequelize.query("SELECT * FROM sym_garage_news n WHERE (n.garage_no = 0 AND n.status = 1) OR n.garage_no = :garage_no ORDER BY n.news_id DESC",{ replacements: { garage_no: gid },type: sequelize.QueryTypes.SELECT})
    .then(news => {
        if(news.length != 0){
            callback(news,true);
        }else{
            callback(null,false);
        }
    });
  },
  getBreakdownCounts: function(start,gid,callback) {
    RequestObj.count('req_no', { where: { created_at: { [Op.gte]: start } } }).then(count_breakdowns => {
        RequestObj.count('req_no', { where: { created_at: { [Op.gte]: start },req_status: {[Op.any]: [5,6]}, rider_no: gid } }).then(count_completed => {
            callback({count_breakdowns:count_breakdowns,count_completed:count_completed});
        });
    });
  },*/
};
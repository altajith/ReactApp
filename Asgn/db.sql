create table asg_users(
	uid integer not null auto_increment,
	name varchar(200),
	socket_id text,
	socket_connected integer default 0,
	created_at datetime,
	updated_at datetime,
	primary key(uid)
);

create table asg_groups(
	gid integer not null auto_increment,
	public_group integer default 1,
	group_name varchar(100) default 'none',
	created_at datetime,
	updated_at datetime,
	primary key(gid)
); 

create table asg_messages(
	mid integer not null auto_increment,
	uid integer,
	gid integer,
	message text,
	type char(10) default 'text',
	created_at datetime,
	updated_at datetime,
	primary key(mid),
	foreign key (gid) references asg_groups(gid),
	foreign key (uid) references asg_users(uid)
); 

create table asg_group_users( 
	gid integer, 
	uid integer,
	created_at datetime,
	updated_at datetime,
	primary key(gid,uid),
	foreign key (gid) references asg_groups(gid),
	foreign key (uid) references asg_users(uid)
); 
import React, { Component } from 'react';
import {reactLocalStorage} from 'reactjs-localstorage';
import Moment from 'react-moment';

Moment.globalFormat = 'D MMM YYYY, HH:mm A';
var Scroll  = require('react-scroll');
var scroll     = Scroll.animateScroll;

class BubbleMe extends Component {
	constructor(props) {
      super(props)
    }

    render() {
    	var deletef = this.props.delete;
    	var editf = this.props.edit;
    	var mid = this.props.mid;
    	var msg = this.props.message;
    	var type = this.props.type;
    	if(type == 'image'){
	        return(
	        	<div className="BubbleWrapper">
		            <div className="BubbleMe-panel" id="bubbleme">
		            	<div className="MessageMeUser">{this.props.username}</div>
			            <div className="MessageMe"><img width="50" src={"http://localhost:3333/view?path="+msg}/></div>
		    			<div className="MessageMeDate"><Moment>{this.props.datetime}</Moment></div>
		    			<a className="Delete" onClick={() => deletef(mid)}>delete</a>
		            </div>
	            </div>
	        );
    	}else{
	        return(
	        	<div className="BubbleWrapper">
		            <div className="BubbleMe-panel" id="bubbleme">
		            	<div className="MessageMeUser">{this.props.username}</div>
			            <div className="MessageMe">{msg}</div>
		    			<div className="MessageMeDate"><Moment>{this.props.datetime}</Moment></div>
		    			<a className="Delete" onClick={() => deletef(mid)}>delete</a>
		    			<a className="Edit" onClick={() => editf(mid,msg)}>edit</a>
		            </div>
	            </div>
	        );
    	}
    }
}

class BubbleYou extends Component {
	constructor(props) {
      super(props)
    }

    render() {
    	var msg = this.props.message;
    	var type = this.props.type;
    	var chatwithuser = this.props.chatwithuser;
    	var ruid = this.props.uid;
    	if(type == 'image'){
    		return(
	        	<div className="BubbleWrapper">
		            <div className="BubbleYou-panel" id="bubbleyou">
		            	<div className="MessageYouUser"><a onClick={() => chatwithuser(ruid)} className="UserChat">{this.props.username}</a></div>
			            <div className="MessageYou"><img width="50" src={"http://localhost:3333/view?path="+msg}/></div>
		    			<div className="MessageYouDate"><Moment>{this.props.datetime}</Moment></div>
		            </div>
	            </div>
	        );
    	}else{
	        return(
	        	<div className="BubbleWrapper">
		            <div className="BubbleYou-panel" id="bubbleyou">
		            	<div className="MessageYouUser"><a onClick={() => chatwithuser(ruid)} className="UserChat">{this.props.username}</a></div>
			            <div className="MessageYou">{msg}</div>
		    			<div className="MessageYouDate"><Moment>{this.props.datetime}</Moment></div>
		            </div>
	            </div>
	        );
    	}
    }
}

export default class Chat extends Component {

    constructor(props) {
      super(props)
      var lg = reactLocalStorage.getObject('login');
      var loggedin = false;
      var uid = 0;
      if(lg != null){
          if(lg.loggedin){
              loggedin = true;
              uid = lg.uid;
          }
      }
      this.state = {
        messages: [],
        messages_ids: [],
        loggedin: loggedin,
        uid: uid
      }
      this.deleteEntry = this.deleteEntry.bind(this);
      this.editEntry = this.editEntry.bind(this);
      this.chatWithUser = this.chatWithUser.bind(this);
    }

	deleteEntry(mid){
        var gid = reactLocalStorage.get('gid');
        this.props.socket.emit('delete_message',{uid:this.state.uid,mid:mid,gid:gid});
	}

	editEntry(mid,mgs_text){
        var gid = reactLocalStorage.get('gid');
        var message = prompt("You can edit your message.", mgs_text);
	    if (message != null) {
        	this.props.socket.emit('edit_message',{uid:this.state.uid,message:message,mid:mid,gid:gid});
	    }
	}

	chatWithUser(ruid){
        this.props.socket.emit('private_message',{uid:this.state.uid,ruid:ruid});
	}

    componentDidMount() {
        var self = this;
        if(typeof this.props.socket != 'undefined'){
            this.props.socket.on('get_group_chat_by_gid', function(res){
            	var messages_loc = [];
            	var messages_ids_loc = [];
                for (var i = 0; i < res.data.length; i++) {
                    var item = res.data[i];
                    var name = 'Unknown';
                    if(item.user != null){
                    	name = item.user.name;
                    }
                    if(parseInt(self.state.uid) == parseInt(item.uid)){
                    	messages_loc.push(<BubbleMe uid={item.uid} type={item.type} message={item.message} edit={self.editEntry} delete={self.deleteEntry} mid={item.mid} username={name} datetime={item.created_at} />);
                    }else{
                    	messages_loc.push(<BubbleYou uid={item.uid} chatwithuser={self.chatWithUser} type={item.type} message={item.message} username={name} datetime={item.created_at} />);
                    }
                    messages_ids_loc.push(item);
                }
                self.setState({messages: messages_loc});
                self.setState({messages_ids: messages_ids_loc});
                scroll.scrollToBottom();
            });

            this.props.socket.on('send_message_broadcast', function(res){
            	var messages_loc = self.state.messages;
            	var messages_ids_loc = self.state.messages_ids;
                if(parseInt(self.state.uid) == parseInt(res.uid)){
                	messages_loc.push(<BubbleMe uid={res.uid} type={res.type} message={res.message} edit={self.editEntry} delete={self.deleteEntry} mid={res.mid} username={res.name} datetime={res.created_at} />);
            	}else{
                	messages_loc.push(<BubbleYou uid={res.uid} chatwithuser={self.chatWithUser} type={res.type} message={res.message} username={res.name} datetime={res.created_at} />);
            	}
                messages_ids_loc.push(res);
                self.setState({messages: messages_loc});
                self.setState({messages_ids: messages_ids_loc});
                scroll.scrollToBottom();
            });

            this.props.socket.on('delete_message_broadcast', function(res){
				var messages_loc = self.state.messages;
				var messages_ids_loc = self.state.messages_ids;
				for (var i = 0; i < messages_ids_loc.length; i++) {
					var msg = messages_ids_loc[i];
					if(parseInt(msg.mid) == parseInt(res.mid)){
						messages_ids_loc.splice(i, 1);
						messages_loc.splice(i, 1);
					}
				}
		        self.setState({messages: messages_loc});
		        self.setState({messages_ids: messages_ids_loc});
            });

            this.props.socket.on('edit_message_broadcast', function(res){
				var messages_loc = self.state.messages;
				var messages_ids_loc = self.state.messages_ids;
				for (var i = 0; i < messages_ids_loc.length; i++) {
					var msg = messages_ids_loc[i];
					if(parseInt(msg.mid) == parseInt(res.mid)){

	                    var name = msg.name;
	                    if(msg.user != null){
	                    	name = msg.user.name;
	                    }
		                if(parseInt(self.state.uid) == parseInt(res.uid)){
		                	messages_loc[i] = <BubbleMe uid={res.uid} type={res.type} message={res.message} edit={self.editEntry} delete={self.deleteEntry} mid={msg.mid} username={name} datetime={msg.created_at} />;
		            	}else{
		                	messages_loc[i] = <BubbleYou uid={res.uid} chatwithuser={self.chatWithUser} type={res.type} message={res.message} username={name} datetime={msg.created_at} />;
		            	}
		            	messages_ids_loc[i].message = res.message;
					}
				}
		        self.setState({messages: messages_loc});
		        self.setState({messages_ids: messages_ids_loc});
            });
        }
    }

    render() {
        return (
          <div class="Chat-view">
          {this.state.messages}
          </div>
        );
    }
}
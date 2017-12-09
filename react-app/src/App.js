import React, { Component } from 'react';
import { Nav,NavItem,Button,Col } from 'react-bootstrap';
import { SocketProvider,socketConnect } from 'socket.io-react';
import io from 'socket.io-client';
import {reactLocalStorage} from 'reactjs-localstorage';

import Login from './Login';
import ChatList from './ChatList';
import Chat from './Chat';
import ChatBar from './ChatBar';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';

var FontAwesome = require('react-fontawesome');

var socket;

ReactDOM.render(<Login />, document.getElementById('root'));
ReactDOM.render(<ChatList />, document.getElementById('root'));
ReactDOM.render(<Chat />, document.getElementById('root'));


class App extends Component {
  constructor(props){
    super(props);

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
      loggedin: loggedin,
      reload: true,
      uid: uid,
      showBar: false
    }
    this.logoutFunc = this.logoutFunc.bind(this);
    this.callfuncLoadGroup = this.callfuncLoadGroup.bind(this);
    this.createNewGroup = this.createNewGroup.bind(this);
    this.openChatList = this.openChatList.bind(this);

    socket = io.connect("http://localhost:3333?uid="+uid);
  }

  changeLoggedin(pval){
      this.setState({ loggedin: pval });
  }

  logoutFunc(){
    reactLocalStorage.set('login', null);
    reactLocalStorage.clear();
    this.setState({ loggedin: false });
  }


  callfuncLoadGroup(gid){
    reactLocalStorage.set('gid', gid);
    socket.emit('get_group_chat_by_gid',{gid: gid,uid: this.state.uid});
    this.setState({ showBar: true });
    document.getElementById("ChatList").style.display = "none";
  }


  createNewGroup(){
    var group = prompt("Enter the name of your group.", "");
    if (group != null) {
        socket.emit('create_group',{uid:this.state.uid,group:group});
    }
  }

  openChatList(){
    if(document.getElementById("ChatList").style.display == "none"){
      document.getElementById("ChatList").style.display = "block";
    }else{
      document.getElementById("ChatList").style.display = "none";
    }
    this.setState({reload: !this.state.reload});
  }

  render() {
    var logout = '';
    var chatlistnav = '';
    var newchatnav = '';
    var chatlist = '';
    var chatbar = '';
    var chat = '';
    var login = <Login socket={socket} logincall={this.changeLoggedin.bind(this)} />;
    if(this.state.loggedin){
      logout = <NavItem eventKey={3} onClick={this.logoutFunc} href="#">Logout</NavItem>;
      chatlistnav = <NavItem eventKey={1} onClick={() => this.openChatList()} href="#">Chat List</NavItem>;
      newchatnav = <NavItem eventKey={2} onClick={() => this.createNewGroup()} href="#">New Group</NavItem>;
      chatlist = <ChatList reload={this.state.reload} socket={socket} callfunc={this.callfuncLoadGroup} />;
      if(this.state.showBar){
        chatbar = <ChatBar socket={socket} />;
      }
      chat = <Chat socket={socket} />;
      login = '';
    }

    return (
      <div className="App">
        <header className="App-header">
          <Nav bsStyle="pills">
            {chatlistnav}
            {newchatnav}
            {logout}
          </Nav>
        </header>
        <p className="App-intro">
          <Col md={12}>
            {chatlist}
          </Col>
          <Col md={12}>
            {chat}
            {chatbar}
            {login}
          </Col>
        </p>
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import { FormControl,Button } from 'react-bootstrap';
import {reactLocalStorage} from 'reactjs-localstorage';
import Dropzone from 'react-dropzone';

var FontAwesome = require('react-fontawesome');

export default class ChatBar extends Component {
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
        message: "",
        loggedin: loggedin,
        uid: uid
      }
      this.changeMessageText = this.changeMessageText.bind(this);
    }

    sendmessage(){
      if(typeof this.props.socket != 'undefined'){
        if(this.state.message != ""){
          var gid = reactLocalStorage.get('gid');
          this.props.socket.emit('send_message',{uid:this.state.uid,gid:gid,message:this.state.message,type:"text"});
          this.setState({ message: "" });
        }
      }
    }

    changeMessageText(e) {
      this.setState({ message: e.target.value });
    }

    onDrop(files) {
      var gid = reactLocalStorage.get('gid');
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('gid', gid);
      formData.append('uid', this.state.uid);
      fetch("http://localhost:3333/message/image/upload", {
        mode: 'no-cors',
        method: "POST",
        body: formData
      }).then(function (res) {
      }, function (e) {
        alert("Error uploading image!");
      });
    }

    render() {
      if(this.state.loggedin){
        return (
          <div class="Chat-bar">

          <div className="dropzone">
            <Dropzone onDrop={this.onDrop.bind(this)} accept="image/jpeg, image/png" style={{position: "fixed",width: 50, height: 50,color: "#2e6ea6",fontSize: 30,bottom: -13,right: 36,cursor: "pointer",zIndex:99}}>
              <FontAwesome name="picture-o" />
            </Dropzone>
          </div>

          <FormControl
              value={this.state.message}
              type="text"
              className="Chat-text"
              placeholder="Enter your message here..."
              onChange={this.changeMessageText}
            />
          <Button bsStyle="primary Send-btn" onClick={() => this.sendmessage()}><FontAwesome name="paper-plane" /></Button>
          </div>
        );
      }else{
        return("");
      }
    }
}
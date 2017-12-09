import React, { Component } from 'react';
import { socketConnect } from 'socket.io-react';
import { Button } from 'react-bootstrap';
import {reactLocalStorage} from 'reactjs-localstorage';

var FontAwesome = require('react-fontawesome');

class Entry extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var gname = this.props.gname;
        var gid = this.props.gid;
        var callfunc = this.props.callfunc;

        return(
            <div className="Entry-panel" onClick={() => callfunc(gid)} id="username">
            <FontAwesome name='comments' /> {gname}
            </div>
        );
    }
}

export default class ChatList extends Component {

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
        entries: [],
        uid: uid,
        loggedin: loggedin
      }
    }

    componentDidMount() {
        var self = this;
        if(typeof this.props.socket != 'undefined' && this.state.loggedin){
            this.props.socket.emit('get_public_group_list',{uid: this.state.uid});
            this.props.socket.on('get_public_group_list', function(res){
                var gps = [];
                for (var i = 0; i < res.data.length; i++) {
                    var item = res.data[i];
                    gps.push(<Entry gname={item.group_name} gid={item.gid} callfunc={self.props.callfunc} />);
                }
                self.setState({entries: gps});
            });
        }
    }

    render() {
        return (
          <div class="Chat-list" id="ChatList">
          {this.state.entries}
          </div>
        );
    }
}
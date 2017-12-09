import React, { Component } from 'react';
import { socketConnect } from 'socket.io-react';

var FontAwesome = require('react-fontawesome');

class Entry extends Component {
    render() {
        var gname = this.props.gname;
        return(
            <div className="Entry-panel" id="username">
            <FontAwesome name='user' /> {gname}
            </div>
        );
    }
}

export default class SideBar extends Component {

    constructor(props) {
      super(props)
      this.state = {
        entries: []
      }
    }

    componentDidMount() {
        var self = this;
        if(typeof this.props.socket != 'undefined'){
            this.props.socket.emit('get_public_group_list',{});
            this.props.socket.on('get_public_group_list', function(res){
                var gps = [];
                for (var i = 0; i < res.data.length; i++) {
                    var item = res.data[i];
                    gps.push(<Entry gname={item.group_name} />);
                }
                self.setState({entries: gps});
            });
        }
    }

    render() {
        return (
          <div class="Chat-list" id="SideBar">
          {this.state.entries}
          </div>
        );
    }
}
import React, { Component } from 'react';
import { Popover,Modal,Button,FormControl } from 'react-bootstrap';
import {reactLocalStorage} from 'reactjs-localstorage';

export default class Login extends Component {
  constructor(props) {
    super(props)

    var lg = reactLocalStorage.getObject('login');
    var loggedin = false;
    if(lg != null){
        if(lg.loggedin){
            loggedin = true;
        }
    }

    this.state = {
        loggedin: loggedin,
        showModal: false,
        name: ""
    }
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.login = this.login.bind(this);
    this.changeUserName = this.changeUserName.bind(this);
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  login(){
      if(typeof this.props.socket != 'undefined'){
        var self = this;
        if(this.state.name != ''){
            this.props.socket.emit('login_user',{name: this.state.name});
            this.props.socket.on('login_user', function(res){
                var result = res.data;
                if(result.res){
                    self.setState({ loggedin: true });
                    reactLocalStorage.setObject('login', {'name': self.state.name,'uid': result.usr, 'loggedin': true});
                    self.close();
                    self.props.logincall(true);
                }
            });
        }
      }
  }
 
  changeUserName(e) {
    this.setState({ name: e.target.value });
  }

  render() {
    if(!this.state.loggedin){
        return (
          <div className="LoginView">
            <Button
              bsStyle="primary"
              bsSize="large"
              onClick={this.open}
            >
              Login
            </Button>

            <Modal show={this.state.showModal} onHide={this.close}>
              <Modal.Header closeButton>
                <Modal.Title>Login</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h4>Enter your name</h4>
                <FormControl
                    value={this.state.name}
                    type="text"
                    placeholder="Your name"
                    onChange={this.changeUserName}
                  />
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={this.close}>Close</Button>
                <Button bsStyle="danger" onClick={this.login}>Login</Button>
              </Modal.Footer>
            </Modal>
          </div>
        );
    }else{
        return("");
    }
  }
}
import React, { Component } from 'react';
import config from "./config";

let getRequestOptions;

export class Profile extends Component {
    state = {
        user : null,
        displayName : "",
        email : "",
        phone : "",
        zip : "",
        pwd : "",
        pwdcon : "",
        pwdError: "",
        prevAvatar : "",
        prevDisplayName : "",
        prevEmail : "",
        prevPhone : "",
        prevZip : "",
        prevPwd : "******"
    };

    alertMsg = "";
    profilePic = "//live.staticflickr.com/65535/50330105386_05247b0873_6k.jpg";

    getCookie = (cname) => {
        const name = cname + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    componentDidMount() {
        let user = this.getCookie("user");
        this.setState({ user : user });
        getRequestOptions = {
            method : 'GET',
            redirect : 'follow',
            credentials : 'include',
            headers : { 'Content-Type': 'application/json' }
        };

        fetch(`${config.backend.url}avatar/${user}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    this.setState({ prevAvatar : obj.avatar });
                });
            }
        });
        fetch(`${config.backend.url}displayName/${user}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    this.setState({ prevDisplayName : obj.displayName });
                });
            }
        });
        fetch(`${config.backend.url}email/${user}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    this.setState({ prevEmail : obj.email });
                });
            }
        });
        fetch(`${config.backend.url}phone/${user}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    this.setState({ prevPhone : obj.phone });
                });
            }
        });
        fetch(`${config.backend.url}zipcode/${user}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    this.setState({ prevZip : obj.zipcode });
                });
            }
        });
    }

    handleChange = event => {
        if(event.target.validity.patternMismatch) {
            if(event.target.name === "phone") {
                event.target.setCustomValidity("Expect format of 123-123-1234.");
            }else if(event.target.name === "zip") {
                event.target.setCustomValidity("Expect format of 5 digits.");
            }
        } else {
            event.target.setCustomValidity("");
        }
        this.setState({ [event.target.name] : event.target.value});
    }

    validate = () => {
        let pwdError = "";
        if(this.state.pwd !== this.state.pwdcon){
            pwdError = "The password confirmation does not match password.";
        }
        if(pwdError){
            this.setState({ pwdError });
            return false;
        }
        return true;
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const isValid = this.validate();
        if(isValid){
            let alertMsg = "";
            let requestOptions = {
                method: 'PUT',
                redirect: 'follow',
                credentials : 'include',
                headers : { 'Content-Type': 'application/json' }
            };
            if(this.state.displayName !== "" && this.state.displayName !== this.state.prevDisplayName){
                requestOptions.body = JSON.stringify({ "displayName": this.state.displayName });
                fetch(`${config.backend.url}displayName`, requestOptions).then(response => {
                    if(response.status === 200) {
                        alertMsg += `DisplayName changed from ${this.state.prevDisplayName} to ${this.state.displayName}; `;
                        this.setState({ prevDisplayName : this.state.displayName, displayName : "" });
                    }
                });
            }
            if(this.state.email !== "" && this.state.email !== this.state.prevEmail){
                requestOptions.body = JSON.stringify({ "email": this.state.email });
                fetch(`${config.backend.url}email`, requestOptions).then(response => {
                    if(response.status === 200) {
                        alertMsg += `Email changed from ${this.state.prevEmail} to ${this.state.email}; `;
                        this.setState({ prevEmail : this.state.email, email : "" });
                    }
                });
            }
            if(this.state.phone !== "" && this.state.phone !== this.state.prevPhone){
                requestOptions.body = JSON.stringify({ "phone": this.state.phone });
                fetch(`${config.backend.url}phone`, requestOptions).then(response => {
                    if(response.status === 200) {
                        alertMsg += `Phone changed from ${this.state.prevPhone} to ${this.state.phone}; `;
                        this.setState({ prevPhone : this.state.phone, phone : "" });
                    }
                });
            }
            if(this.state.zip !== "" && this.state.zip !== this.state.prevZip){
                requestOptions.body = JSON.stringify({ "zipcode": this.state.zip });
                fetch(`${config.backend.url}zipcode`, requestOptions).then(response => {
                    if(response.status === 200) {
                        alertMsg += `Zip changed from ${this.state.prevZip} to ${this.state.zip}; `;
                        this.setState( { prevZip : this.state.zip, zip : "" });
                    }
                });
            }
            if(this.state.pwd !== ""){
                requestOptions.body = JSON.stringify({ "password": this.state.pwd });
                fetch(`${config.backend.url}password`, requestOptions).then(response => {
                    if(response.status === 200) {
                        alertMsg += `Password Changed; `;
                        this.setState( { pwd : "" , pwdcon : "", pwdError: "" });
                    }
                });
            }

            if(alertMsg){
                this.alertMsg = alertMsg;
            }else {
                this.alertMsg = "";
            }
        }
    }

    goToMain = () => {
        let updateParentState = this.props.updateParentState;
        document.cookie = `showMain=true; path=/ `;
        updateParentState({ showMain: true });
    }

    handleImageUpload = (event) => {
        if (event.target.files.length !== 0) {
            let image = event.target.files[0];
            const fd = new FormData();
            fd.append('image', image);
            let requestOptions = {
                body: fd,
                method: 'PUT',
                redirect: 'follow',
                credentials : 'include',
            };
            fetch(`${config.backend.url}avatar`, requestOptions).then(response => {
                if(response.status === 200) {
                    response.json().then((res) => {
                        this.setState( { prevAvatar : res.avatar });
                    });
                }
            });
        }
    }

    render() {
        return(
            <div className="container pt-3 mx-auto">
                <div className="container pt-4 mx-auto">
                    <h1 className="text-center display-3">My Profile</h1>
                </div>
                <div><button className="btn btn-primary" onClick={this.goToMain}>Main</button></div>

                <div className="row">
                    <div className="col p-4 my-3">
                        <div className="container my-4">{
                            this.state.prevAvatar ?
                                <img className="img-thumbnail" id="img_hairong" src={this.state.prevAvatar} />
                                :
                                <img className="img-thumbnail" id="img_hairong" src={this.profilePic} />
                        }</div>
                        <div className="container" >
                            <div className="custom-file">
                                <input className="form-control custom-file-input" type="file" accept="image/*" id="image" name="image" onChange={this.handleImageUpload}/>
                                <label className="custom-file-label" htmlFor="image">Choose a picture</label>
                            </div>
                        </div>

                        <div className="my-5"><h2 className="display-4 text-center">Current Info</h2></div>
                        <div className="text-center h6" id="prev_displayName">{this.state.prevDisplayName}</div>
                        <div className="text-center h6" id="prev_email">{this.state.prevEmail}</div>
                        <div className="text-center h6" id="prev_phone">{this.state.prevPhone}</div>
                        <div className="text-center h6" id="prev_zip">{this.state.prevZip}</div>
                        <div className="text-center h6" id="prev_pwd">{this.state.prevPwd}</div>
                    </div>

                    <div className="col p-5 mx-auto my-5 bg-dark text-white">
                        <div className="mb-2"><h2 className="display-4 text-center">Update Info</h2></div>
                        <div className="alert" id="changeAlert">{this.alertMsg}</div>
                        <form className="form-horizontal" onSubmit={this.handleSubmit}>
                            <div className="form-group">
                                <label className="h6">Display Name:</label>
                                <input className="form-control" onChange={this.handleChange} value={this.state.displayName}
                                name="displayName" id="displayName" placeholder="your display name" />
                            </div>

                            <div className="form-group">
                                <label className="h6">Email Address:</label>
                                <input className="form-control" onChange={this.handleChange} value={this.state.email}
                                type="email" name="email" id="email" placeholder="example@email.com" />
                            </div>

                            <div className="form-group">
                                <label className="h6">Phone Number:</label>
                                <input className="form-control" onChange={this.handleChange} value={this.state.phone}
                                type="tel" name="phone" id="phone" placeholder="123-123-1234" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" />
                            </div>

                            <div className="form-group">
                                <label className="h6">ZipCode:</label>
                                <input className="form-control" onChange={this.handleChange} value={this.state.zip}
                                type="tel" name="zip" id="zip" placeholder="77005" pattern="[0-9]{5}" />
                            </div>

                            <div className="form-group">
                                <label className="h6">Password:</label>
                                <input className="form-control" onChange={this.handleChange} value={this.state.pwd}
                                       name="pwd" id="pwd" type="password" placeholder="password" />
                            </div>

                            <div className="form-group">
                                <label className="h6">Password Confirmation:</label>
                                <input className="form-control" onChange={this.handleChange} value={this.state.pwdcon}
                                name="pwdcon" id="pwdcon" type="password" placeholder="password confirmation" />
                                <div>{this.state.pwdError}</div>
                            </div>

                            <div className="form-group">
                                <button className="btn btn-primary" type="submit">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

}

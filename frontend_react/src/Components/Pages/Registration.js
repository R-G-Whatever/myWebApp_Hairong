import React, { Component } from 'react';
import config from "./config";

export class Registration extends Component {
    state = {
        accountName : "",
        displayName : "",
        email : "",
        phone : "",
        dob : "",
        zip : "",
        pwd : "",
        pwdcon : "",
        timestamp : "",
        dobError : "",
        pwdError: "",
        userNameError: ""
    };

    handleChange = event => {
        if(event.target.validity.patternMismatch) {
            if(event.target.name === "accountName") {
                event.target.setCustomValidity("Account name must only contain numbers and letters, and must not start with a number.");
            }else if(event.target.name === "phone") {
                event.target.setCustomValidity("Expect format of 123-123-1234.");
            }else if(event.target.name === "zip") {
                event.target.setCustomValidity("Expect format of 5 digits.");
            }
        } else {
            event.target.setCustomValidity("");
        }
        this.setState({ [event.target.name] : event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let userNameError = "";
        let dobError = "";
        let pwdError = "";

        if(this.state.pwd !== this.state.pwdcon){
            pwdError = "The password confirmation does not match password.";
        }

        let birth = new Date(this.state.dob);
        let current = new Date();
        current.setFullYear(current.getFullYear() - 18);
        if(current < birth){
            dobError = "You must be over 18 years old to register.";
        }

        if(dobError){
            this.setState({ dobError });
        } else {
            this.setState({ dobError : "" });
        }
        if(pwdError){
            this.setState({ pwdError });
        } else {
            this.setState({ pwdError : "" });
        }

        let dob = birth.getTime();

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
            "username" : this.state.accountName,
            "displayName" : this.state.displayName,
            "password" : this.state.pwd,
            "dob" : dob,
            "email" : this.state.email,
            "phone" : this.state.phone,
            "zipcode" : this.state.zip
        });

        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        fetch(`${config.backend.url}register`, requestOptions).then( response => {
            if (response.status === 200) {
                this.setState({
                    accountName : "",
                    displayName : "",
                    email : "",
                    phone : "",
                    dob : "",
                    zip : "",
                    pwd : "",
                    pwdcon : "",
                    timestamp : "",
                    dobError : "",
                    pwdError: "",
                    userNameError: ""
                });
            } else if ( response.statusText === "This username exists in database." ) {
                userNameError = "This account name is already registered, please use a different name."
            } else {
                userNameError = "An error occurs in login, please try again."
            }

            if(userNameError){
                this.setState({ userNameError });
            } else {
                this.setState({ userNameError : "" });
            }
        });
    }

    render() {
        return(
            <div className="col container p-5 mx-3 my-4 bg-dark text-white">
                <div className="mb-4" style={{'textAlign' : 'center'}}><h2 className="display-4">Register</h2></div>
            <form className="form-horizontal" onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label className="h6">Account Name:</label>
                    <input className="form-control" onChange={this.handleChange} value={this.state.accountName}
                           name="accountName" id="accountName" pattern="[A-Za-z][A-Za-z0-9]*"
                           placeholder="your account name" required />
                    <div>{this.state.userNameError}</div>
                </div>
                <div className="form-group">
                    <label className="h6">Display Name:</label>
                    <input className="form-control" onChange={this.handleChange} value={this.state.displayName}
                        name="displayName" id="displayName" placeholder="your display name" />
                </div>

                <div className="form-group">
                    <label className="h6">Email Address:</label>
                    <input className="form-control" onChange={this.handleChange} value={this.state.email}
                        type="email" name="email" id="email" placeholder="example@email.com" required />
                </div>

                <div className="form-group">
                    <label className="h6">Phone Number:</label>
                    <input className="form-control" onChange={this.handleChange} value={this.state.phone}
                        type="tel" name="phone" id="phone" placeholder="123-123-1234" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" required />
                </div>

                <div className="form-group">
                    <label className="h6">Date Of Birth:</label>
                    <input className="form-control" onChange={this.handleChange} value={this.state.dob}
                        type="date" name="dob" id="dob" required />
                    <div>{this.state.dobError}</div>
                </div>

                <div className="form-group">
                    <label className="h6">ZipCode:</label>
                    <input className="form-control" onChange={this.handleChange} value={this.state.zip}
                        type="tel" name="zip" id="zip" placeholder="77005" pattern="[0-9]{5}" required />
                </div>

                <div className="form-group">
                    <label className="h6">Password:</label>
                    <input className="form-control" onChange={this.handleChange} value={this.state.pwd}
                        name="pwd" id="pwd" type="password" placeholder="password" required />
                </div>

                <div className="form-group">
                    <label className="h6">Password Confirmation:</label>
                    <input className="form-control" onChange={this.handleChange} value={this.state.pwdcon}
                        name="pwdcon" id="pwdcon" type="password" placeholder="password confirmation" />
                    <div>{this.state.pwdError}</div>
                </div>

                <div className="form-group">
                    <input className="form-control" type="hidden" name="timestamp" id="timestamp" />
                </div>

                <div className="form-group">
                    <button className="btn btn-primary mr-2" type="submit">Submit</button>
                    <button className="btn btn-secondary" type="reset">Clear</button>
                </div>
            </form>
            </div>
        )
    }
}

import React, {Component} from "react";
import config from "./config";

export class LogIn extends Component {
    state = {
        accountName: "",
        accountNameError: "",
        pwd: "",
        pwdError: ""
    };

    handleChange = event => {
        this.setState({ [event.target.name] : event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let updateParentState = this.props.updateParentState;

        let accountNameError = "";
        let pwdError = "";

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            credentials : 'include',
            body: JSON.stringify({ "username": this.state.accountName , "password": this.state.pwd }),
            redirect: 'follow'
        };
        fetch(`${config.backend.url}login`, requestOptions).then(response => {
            if (response.status === 200) {
                document.cookie = `user=${ this.state.accountName }; path=/ `;
                document.cookie = `showMain=true; path=/ `;
                updateParentState({ loggedIn : true, showMain : true });
                return;
            } else if (response.statusText === "Error in query: No user.") {
                accountNameError = "This user does not exist."
            } else if (response.statusText === "Password Incorrect.") {
                pwdError = "The password is incorrect."
            } else {
                accountNameError = "An error occurs in login, please try again."
            }

            if (accountNameError) {
                this.setState({ accountNameError });
            } else {
                this.setState({ accountNameError : "" });
            }

            if (pwdError) {
                this.setState({ pwdError });
            } else {
                this.setState({ pwdError : "" });
            }
        });
    }

    render() {
        return(
            <div className="col container p-5 mx-3 my-4">
                <div className="mb-4" style={{'textAlign' : 'center'}}><h2 className="display-4">Login</h2></div>
                <form className="form-horizontal" onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label className="h6">Account Name:</label>
                        <input className="form-control" onChange={this.handleChange} value={this.state.accountName}
                               name="accountName" id="accountName_log"
                               placeholder="your account name" required />
                        <div>{this.state.accountNameError}</div>
                    </div>
                    <div className="form-group">
                        <label className="h6">Password:</label>
                        <input className="form-control" onChange={this.handleChange} value={this.state.pwd}
                               name="pwd" id="pwd_log" type="password" placeholder="password" required />
                        <div>{this.state.pwdError}</div>
                    </div>
                    <div className="form-group" >
                        <button className="btn btn-primary" type="submit">Submit</button>
                    </div>
                </form>
                <a className="text-center" href={`${config.backend.url}facebook`} >Login with Facebook</a>
            </div>
        )
    }
}

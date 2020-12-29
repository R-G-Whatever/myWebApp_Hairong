import React, { Component } from 'react';
import { Registration } from "./Pages/Registration";
import { Main } from "./Pages/Main";
import { Profile } from "./Pages/Profile";
import { LogIn } from "./Pages/LogIn";

export class Auth extends Component {

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

    state = {
        loggedIn : (this.getCookie('hasSid') === "1" && !!this.getCookie('user')),
        showMain : (this.getCookie('showMain') === "true")
    }

    updateParentState = (arg) => {
        this.setState(arg);
    }

    render() {
        return(
            this.state.loggedIn === false ? (
            <div className="container-fluid">
                <div className="container pt-4 mx-auto mb-4"><h1 className="text-center display-3">Welcome to FolksZone!</h1></div>
                <div className="row">
                    <Registration />
                    <LogIn updateParentState = { this.updateParentState } />
                </div>
            </div>) : ( this.state.showMain ?
                    <Main updateParentState = { this.updateParentState } /> :
                    <Profile updateParentState = { this.updateParentState } />
            )
        )
    }
}


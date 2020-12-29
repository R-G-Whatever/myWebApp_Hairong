import React, { Component } from 'react';
import config from "./config";

let getRequestOptions;

const initialState = {
    user : "",
    loadFollowing : true,
    loadPosts : true,

    following : [],
    followingAvatars : [],
    followingHeadlines : [],
    myHeadline : "",
    myAvatar : "",
    myHeadlinePrev : "",
    newFollowing : "",
    newFollowError: "",

    posts : [],
    filterInput : null,
    filteredPosts : [],
    newPost : "",
    newPic : "",
    picAttached : false
}

export class Main extends Component {

    state = initialState;
    componentDidMount() {
        let user = this.getCookie("user");
        this.setState({ user : user });
        getRequestOptions = {
            method : 'GET',
            redirect : 'follow',
            credentials : 'include',
            headers : { 'Content-Type': 'application/json' }
        };

        fetch(`${config.backend.url}headline/${user}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    this.setState({ myHeadlinePrev : obj.headline });
                    let headlines = {...this.state.followingHeadlines};
                    headlines[user] = obj.headline;
                    this.setState({ followingHeadlines : headlines });
                });
            }
        });

        fetch(`${config.backend.url}avatar/${user}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    this.setState({ myAvatar : obj.avatar });
                    let avatars = {...this.state.followingAvatars};
                    avatars[user] = obj.avatar;
                    this.setState({ followingAvatars : avatars });
                });
            }
        });

        fetch(`${config.backend.url}following/${user}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    this.setState({ following : obj.following, loadFollowing : false });
                    let followings = obj.following;
                    for (let element of followings) {
                        this.getFriendAvatar(element);
                        this.getFriendHeadline(element);
                    }
                });
            }
        });

        this.updatePosts();
    }

    updatePosts() {
        fetch(`${config.backend.url}articles`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    let articles = obj.articles;
                    articles.sort((a, b) => {
                        return a.pid < b.pid ? 1 : -1;
                    });
                    this.setState({ posts : articles, loadPosts : false });
                });
            }
        });
    }

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

    handleLogOut = () => {
        let requestOptions = {
            method: 'PUT',
            credentials : 'include',
            redirect: 'follow',
            headers: { 'Content-Type': 'application/json' }
        };
        fetch(`${config.backend.url}logout`, requestOptions).then((res) => {
            if (res.status !== 200) {
                console.log("Logout failed, try again.");
            } else {
                this.setState(initialState);
                let updateParentState = this.props.updateParentState;
                document.cookie = `user=; path=/ `;
                document.cookie = `hasSid=; path=/ `;
                updateParentState({ loggedIn : false });
            }
        });
    }

    goToProfile = () => {
        let updateParentState = this.props.updateParentState;
        document.cookie = `showMain=false; path=/ `;
        updateParentState({ showMain: false });
    }

    changeMyHeadline = (event) => {
        this.setState({ myHeadline : event.target.value });
    }

    submitNewHeadline = (event) => {
        event.preventDefault();

        let raw = JSON.stringify({ "headline": this.state.myHeadline });

        let requestOptions = {
            method: 'PUT',
            body: raw,
            redirect: 'follow',
            credentials : 'include',
            headers : { 'Content-Type': 'application/json' }
        };

        fetch(`${config.backend.url}headline/`, requestOptions).then(response => {
            if(response.status === 200) {
                this.setState({ myHeadlinePrev : this.state.myHeadline, myHeadline : "" });
            }
        });
    }

    handleUnfollow = (event) => {
        let requestOptions = {
            method: 'DELETE',
            redirect: 'follow',
            credentials : 'include',
            headers : { 'Content-Type': 'application/json' }
        };
        fetch(`${config.backend.url}following/${ event.target.id }`, requestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    let newList = obj.following;
                    this.setState({ following : newList , newFollowError : "", newFollowing : "" });
                    this.updatePosts();
                });
            }
        });
    }

    handleFollow = (event) => {
        event.preventDefault();
        let requestOptions = {
            method: 'PUT',
            redirect: 'follow',
            credentials : 'include',
            headers : { 'Content-Type': 'application/json' }
        };
        fetch(`${config.backend.url}following/${ this.state.newFollowing }`, requestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    let newList = obj.following;
                    this.setState({ following : newList , newFollowError : "", newFollowing : "" });
                    this.updatePosts();
                });
            } else if (response.statusText === "Error: the user to be followed does not exist!") {
                this.setState( { newFollowError : "Following failed. The user does not exist."} );
            } else if (response.statusText === "This user has already been followed.") {
                this.setState( { newFollowError : "This user has already been followed."} );
            }
        });
    }

    getNewFollowing = (event) => {
        this.setState({ newFollowing : event.target.value });
    }

    handleFilterChange = (event) => {
        if(event.target.value !== null || event.target.value !== 0 || event.target.value !== ""){
            this.setState({ filterInput : event.target.value });
            const filteredPosts = this.state.posts.filter(post => {
                return post.body.toLowerCase().includes(event.target.value.toLowerCase()) ||
                    post.author.toLowerCase().includes(event.target.value.toLowerCase())
            });
            this.setState({ filteredPosts : filteredPosts });
        }else{
            this.setState({ filterInput : null });
        }
    }

    getNewPost = (event) => {
        this.setState({ newPost : event.target.value });
    }

    getNewPic = (event) => {
        if(event.target.files.length !== 0){
            this.setState({ newPic : event.target.files[0] , picAttached : true });
        } else {
            this.setState({ newPic : "" , picAttached : false});
        }
    }

    submitNewPost = (event) => {
        event.preventDefault();

        let fd = new FormData();
        fd.append('image', this.state.newPic);
        fd.append('body', this.state.newPost);

        let requestOptions = {
            method: 'POST',
            body: fd,
            redirect: 'follow',
            credentials : 'include'
        };
        fetch(`${config.backend.url}article`, requestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    let posts = obj.articles;
                    posts.sort((a, b) => {
                        return a.pid < b.pid ? 1 : -1;
                    });
                    this.setState({ posts : posts , newPost : "", newPic : "" , picAttached : false});
                });
            }
        });
    }

    handleClearPost = (event) => {
        event.preventDefault();
        this.setState({ newPost : "" , picAttached : false });
        let form = event.target.parentElement;
        form.reset();
    }

    toggleComments = (event) => {
        let comments = document.getElementById(`comment${event.target.parentElement.id}`);
        if (comments.style.display === "none") {
            comments.style.display = "block";
            event.target.innerHTML = "Hide Comments";
        } else {
            comments.style.display = "none";
            event.target.innerHTML = "Show Comments";
        }
    }

    getFriendAvatar = (username) => {
        fetch(`${config.backend.url}avatar/${username}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    if (obj.avatar) {
                        let avatars = { ...this.state.followingAvatars };
                        avatars[username] = obj.avatar;
                        this.setState({ followingAvatars : avatars });
                    }
                });
            }
        });
    }

    getFriendHeadline = (username) => {
        fetch(`${config.backend.url}headline/${username}`, getRequestOptions).then(response => {
            if(response.status === 200) {
                response.json().then((obj) => {
                    let headlines = {...this.state.followingHeadlines};
                    headlines[username] = obj.headline;
                    this.setState({ followingHeadlines : headlines });
                });
            }
        });
    }

    addNewComment = (event) => {
        let p = prompt("New Comment", "");
        if (p !== null && p !== "") {
            let pid = event.target.parentElement.id;
            let raw = JSON.stringify({ "text" : p, "commentId" : -1 });
            let putReqOptions = {
                method: 'PUT',
                body: raw,
                redirect: 'follow',
                credentials : 'include',
                headers : { 'Content-Type': 'application/json' }
            };

            fetch(`${config.backend.url}articles/${pid}`, putReqOptions).then(response => {
                if(response.status === 200) {
                    response.json().then(() => {
                        this.updatePosts();
                    });
                }
            });
        }
    }

    editComment = (event) => {
        let textField = event.target.previousElementSibling;
        let button = event.target;
        if( textField.contentEditable === 'true' ) {
            let pid = event.target.parentElement.parentElement.id.substring(7);
            let commentId = event.target.parentElement.id; // this should be changed
            let raw = JSON.stringify({ "text" : textField.innerHTML, "commentId" : commentId });
            let putReqOptions = {
                method: 'PUT',
                body: raw,
                redirect: 'follow',
                credentials : 'include',
                headers : { 'Content-Type': 'application/json' }
            };

            fetch(`${config.backend.url}articles/${pid}`, putReqOptions).then(response => {
                if(response.status === 200) {
                    response.json().then(() => {
                        this.updatePosts();
                        textField.contentEditable = false;
                        button.innerHTML = "Edit";
                    });
                }
            });
        } else {
            textField.contentEditable = true;
            button.innerHTML = "Submit Change";
        }
    }

    editPost = (event) => {
        let postField = event.target.previousElementSibling;
        let button = event.target;
        if( postField.contentEditable === 'true' ) {
            let pid = event.target.parentElement.id;
            let raw = JSON.stringify({ "text" : postField.innerHTML });
            let putReqOptions = {
                method: 'PUT',
                body: raw,
                redirect: 'follow',
                credentials : 'include',
                headers : { 'Content-Type': 'application/json' }
            };

            fetch(`${config.backend.url}articles/${pid}`, putReqOptions).then(response => {
                if(response.status === 200) {
                    response.json().then(() => {
                        this.updatePosts();
                        postField.contentEditable = false;
                        button.innerHTML = "Edit";
                    });
                }
            });
        } else {
            postField.contentEditable = true;
            button.innerHTML = "Submit Change";
        }
    }


    render() {
        return(
            <div className="row">
                <div className="container pt-4 mx-auto">
                    <h1 className="text-center my-3 display-3">My FolksZone</h1>
                </div>
                <div className="container pt-4 mx-auto">
                    <button name="logOut" className="btn btn-default" onClick={ this.handleLogOut }>LogOut</button>
                    <button className="btn btn-primary" onClick={ this.goToProfile }>Profile</button>
                </div>

                <div className="col px-4 my-5">
                    <div className="mx-auto mb-4"><h2 className="display-4 text-center">Me</h2></div>
                    <div className="container-fluid">
                        <img width = "200" height = "200" style={{'display':'block', 'margin':'auto', 'borderRadius' : '50%', 'objectFit' : 'cover'}} src={ this.state.myAvatar ? this.state.myAvatar : "https://cdn.pixabay.com/photo/2020/10/03/17/06/leaf-5624041_960_720.jpg"} />
                        <div className="container m-1 p-1 h6">{ this.state.user }</div>
                        <div className="container m-1 p-1">{ this.state.myHeadlinePrev }</div>
                        <form className="form-horizontal" onSubmit={ this.submitNewHeadline }>
                            <input className="form-control" onChange={ this.changeMyHeadline } value={ this.state.myHeadline }/>
                            <button className="btn m-1 btn-primary" type="submit">Update Headline</button>
                        </form>
                    </div>
                { !this.state.loadFollowing ?
                    <div className="mt-5 pt-5 bg-dark text-white">
                        <div className="mx-auto mb-4"><h2 className="display-4 text-center">Following</h2></div>
                        <form className="mx-4 my-3" onSubmit={this.handleFollow}>
                            <input className="form-control" onChange={this.getNewFollowing} value={this.state.newFollowing} />
                            <button className="btn btn-primary my-2" type="submit">Follow</button>
                            <div>{this.state.newFollowError}</div>
                        </form>
                        <div className="m-3 pb-4">
                        {this.state.following.map( person => (
                            <div className="p-3 m-3 row border border-secondary rounded" style={{'margin':'auto'}} key={ person } id={ person }>
                                <div className="col col-md-3">
                                    <img width = "100" height = "100" style={{'display':'block', 'margin':'auto', 'borderRadius' : '50%', 'objectFit' : 'cover'}} src={
                                        this.state.followingAvatars[person] ?
                                            this.state.followingAvatars[person]
                                            :
                                            "https://i.pinimg.com/564x/f4/e8/a2/f4e8a2b83ccefdac65f38695b30b1bf5.jpg"
                                    }/>
                                </div>
                                <div className="col col-md-4" style={{'margin':'auto'}}>
                                    <p className="h6" style={{'textAlign':'center'}}>{ person }</p>
                                    <p style={{'textAlign':'center'}}>{ this.state.followingHeadlines[person] }</p>
                                </div>
                                <button className="col col-md-3 btn-secondary btn btn-sm" style={{'margin':'auto'}} id={ person } onClick={ this.handleUnfollow }>Unfollow</button>
                            </div>
                        ))}
                        </div>
                    </div>
                    :
                    <div>loading...</div>
                }
                </div>

                { !this.state.loadPosts ?
                <div className="container col px-4">
                    <div className="container mx-auto mt-5"><h2 className="display-4 text-center">Posts</h2></div>
                    <div className="container mx-auto my-5">
                        <p>Search by author or content</p>
                        <input id="search" name="search" className="form-control mb-5" type="text" onChange={this.handleFilterChange} />
                        <form className="form-horizontal" onSubmit={this.submitNewPost}>
                            <p className="h5">New Post</p>
                            <textarea className="form-control my-2" rows="3" onChange={this.getNewPost} value={this.state.newPost}/>
                            <p className="h6">Add an image</p>
                            <div className="custom-file mb-2">
                                <input className="form-control custom-file-input" type="file" accept="image/*" id = "image" name="image" onChange={this.getNewPic} />
                                <label className="custom-file-label" htmlFor="image">Choose a picture</label>
                            </div>
                            <p className="mb-2">{ this.state.picAttached ? "Picture Attached" : null }</p>
                            <button className="btn btn-primary mx-1" type="submit">Post</button>
                            <button className="btn btn-default mx-1" onClick={this.handleClearPost}>Clear</button>
                        </form>
                    </div>
                    {!this.state.filterInput ?  <div>
                        {this.state.posts.map( post => (
                            <div className="container mx-auto my-2 pt-4 border border-secondary rounded" key={ post.pid } id={ post.pid }>
                                <div className="container mb-2">
                                    <img width = "75" height = "75" style={{'display':'block', 'borderRadius' : '50%', 'objectFit' : 'cover'}} src={ this.state.followingAvatars[post.author] ?
                                    this.state.followingAvatars[post.author]
                                    :
                                    "https://i.pinimg.com/564x/f4/e8/a2/f4e8a2b83ccefdac65f38695b30b1bf5.jpg"
                                } /></div>
                                <span className="container my-1 py-1 h6">{ post.author }</span>
                                <span className="container my-1 py-1">{ post.created }</span>
                                { post.imageUrl ?
                                    <div className="container my-2 w-100">
                                        <img width='350' style={{'display' : 'block', 'margin' : 'auto', 'objectFit' : 'cover'}} src={ post.imageUrl } />
                                    </div>
                                    :
                                    null
                                }
                                <div className="container m-2 p-1 w-100">{ post.body }</div>
                                {
                                    post.author === this.state.user ?
                                        <button className="btn mx-1 mb-2 btn-sm" onClick = { this.editPost }>Edit</button>
                                        :
                                        null
                                }
                                <button className="btn mx-1 mb-2 btn-sm" onClick = { this.addNewComment }>Comment</button>

                                { post.comments && post.comments.length ?
                                    <button className="btn mx-1 mb-2 btn-link btn-sm" onClick = { this.toggleComments }>Hide Comments</button>
                                    :
                                    null
                                }
                                <div className="container m-1 px-1 pb-2" id = {`comment${post.pid}`}>
                                    {post.comments.map( comment => (
                                        <div className="mt-2 pt-2 border-top border-secondary" key = {comment.commentId} id = {comment.commentId}>
                                            <span>
                                                <img className="mr-2" width = "45" height = "45" style={{'display':'inline-block', 'borderRadius' : '50%', 'objectFit' : 'cover'}} src={ this.state.followingAvatars[comment.author] ?
                                                this.state.followingAvatars[comment.author]
                                                :
                                                "https://i.pinimg.com/564x/f4/e8/a2/f4e8a2b83ccefdac65f38695b30b1bf5.jpg"
                                            } /></span>
                                            <span className="h6 mr-2">{comment.author}</span>
                                            <span className="pr-2">{comment.text}</span>
                                            {
                                                comment.author === this.state.user ?
                                                    <button className="btn btn-link btn-sm mt-2 mb-3" style={{'display':'inline-block'}} onClick = { this.editComment }>Edit</button>
                                                    :
                                                    null
                                            }
                                        </div>
                                    )) }
                                </div>

                            </div>))
                        }
                    </div> : <div>
                        {this.state.filteredPosts.map( post => (
                            <div className="container w-75 mx-auto my-5 p-5 bg-dark text-white" key={post.pid}>
                                <div className="container m-1 p-1 h6">{post.author}</div>
                                <div className="container m-1 p-1">{post.body}</div>
                            </div>))
                        }
                    </div>
                    }
                </div> :
                    <div> Loading ... </div>
                }
            </div>
        )
    }
}

const functions = require('firebase-functions');
const app = require('express')();

const {
	getAllPosts,
	getOnePost,
	uploadPost,
	addComment,
	deleteComment,
	likePost,
	unlikePost,
} = require('./handler/post');
const { signup, login } = require('./handler/user');
const FBauth = require('./util/FBauth');

//post stuff
app.get('/posts', getAllPosts);
app.get('/posts/:postId', getOnePost);
app.post('/posts', FBauth, uploadPost);
app.post('/post/:postId/comment', FBauth, addComment);
app.delete('/comment/:commentId', FBauth, deleteComment);
app.post('/post/:postId/like', FBauth, likePost);
app.post('/post/:postId/unlike', FBauth, unlikePost);
/*  deletePost
    likePost
    unlikePost
    deletePost*/
//user stufff
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);

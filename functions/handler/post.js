const { firestore } = require('firebase-admin');
const { db, admin } = require('../util/admin');

exports.getAllPosts = (req, res) => {
	db.collection('posts')
		.orderBy('createdAt', 'desc')
		.get()
		.then((data) => {
			let posts = [];
			data.forEach((doc) => {
				posts.push(doc.data());
			});
			return res.json(posts);
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.uploadPost = (req, res) => {
	if (req.body.body.trim() === '')
		return res.status(400).json({ body: 'body must not be empty' });

	const post = {
		userName: req.user.userName,
		body: req.body.body,
		createdAt: firestore.FieldValue.serverTimestamp(),
	};

	db.collection('posts')
		.add(post)
		.then((doc) => {
			const newPost = post;
			newPost.postId = doc.id;
			return res.status(200).json(newPost);
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: 'something went wrong' });
		});
};

exports.getOnePost = (req, res) => {
	let post = {};
	db.doc(`posts/${req.params.postId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res.status(404).json({ error: 'post not found' });
			}
			post = doc.data();
			post.comments = [];
			return db
				.collection('comments')
				.where('postId', '==', req.params.postId)
				.orderBy('createdAt', 'desc')
				.get();
		})
		.then((data) => {
			data.forEach((doc) => {
				post.comments.push(doc.data());
			});
			return res.json(post);
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: 'something went wrong' });
		});
};

exports.addComment = (req, res) => {
	if (req.body.body.trim() === '')
		return res.status(400).json({ body: 'body must not be empty' });

	const newComment = {
		body: req.body.body,
		postId: req.params.postId,
		userId: req.user.uid,
		userName: req.user.userName,
		createdAt: firestore.FieldValue.serverTimestamp(),
	};

	db.doc(`posts/${req.params.postId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res.status(404).json({ error: 'post not found' });
			}
			return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
		})
		.then(() => {
			db.collection('comments').add(newComment);
		})
		.then(() => {
			return res.status(200).json({ message: 'new comment added' });
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: 'something went wrong' });
		});
};

exports.deleteComment = (req, res) => {
	let postId;
	db.doc(`comments/${req.params.commentId}`)
		.get()
		.then((doc) => {
			if (!doc.exists) {
				return res.status(404).json({ error: 'comment not found' });
			}
			if (doc.data().userId !== req.user.uid) {
				return res.status(403).json({ error: 'unauthorized' });
			}

			postId = doc.data().postId;
			db.doc(`posts/${postId}`)
				.get()
				.then((doc) => {
					doc.ref.update({ commentCount: doc.data().commentCount - 1 });
				});

			return doc.ref.delete();
		})
		.then(() => {
			return res.status(200).json({ message: 'comment deleted' });
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: 'something went wrong' });
		});
};

exports.likePost = (req, res) => {
	db.collection('likes')
		.where('postId', '==', req.params.postId)
		.where('userId', '==', req.user.uid)
		.limit(1)
		.get()
		.then((data) => {
			if (!data.empty) {
				return res.status(404).json({ error: 'post already liked' });
			} else {
				const newLike = {
					postId: req.params.postId,
					userId: req.user.uid,
					createdAt: firestore.FieldValue.serverTimestamp(),
				};
				db.doc(`posts/${req.params.postId}`)
					.get()
					.then((doc) => {
						doc.ref.update({ likeCount: doc.data().likeCount + 1 });
					})
					.then(() => {
						db.collection('likes').add(newLike);
					})
					.then(() => {
						return res.status(200).json({ message: 'like added' });
					})
					.catch((err) => {
						console.log(err);
						return res.status(500).json({ error: 'something went wrong' });
					});
			}
		});
};

exports.unlikePost = (req, res) => {
	db.collection('likes')
		.where('postId', '==', req.params.postId)
		.where('userId', '==', req.user.uid)
		.limit(1)
		.get()
		.then((data) => {
			if (data.empty) {
				return res.status(404).json({ error: 'post have not been liked' });
			} else {
				db.doc(`posts/${req.params.postId}`)
					.get()
					.then((doc) => {
						doc.ref.update({ likeCount: doc.data().likeCount - 1 });
					})
					.then(() => {
						data.docs[0].ref.delete();
					})
					.then(() => {
						return res.status(200).json({ message: 'post unliked' });
					})
					.catch((err) => {
						console.log(err);
						return res.status(500).json({ error: 'something went wrong' });
					});
			}
		});
};

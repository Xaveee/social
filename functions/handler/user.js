const { db, admin } = require('../util/admin');
const { validateSignUp, validateLogin } = require('../util/validator');
const config = require('../util/config');

const firebase = require('firebase');
const { firestore } = require('firebase-admin');
firebase.initializeApp(config);

exports.signup = (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		userName: req.body.userName,
	};
	const { valid, errors } = validateSignUp(newUser);

	if (!valid) return res.status(400).json(errors);

	let authToken, userId;
	db.doc(`/users/${newUser.userName}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return res
					.status(400)
					.json({ message: 'this user name already exist' });
			} else {
				return firebase
					.auth()
					.createUserWithEmailAndPassword(newUser.email, newUser.password);
			}
		})
		.then((data) => {
			userId = data.user.uid;
			return data.user.getIdToken();
		})
		.then((token) => {
			authToken = token;
			const userCredential = {
				userName: newUser.userName,
				email: newUser.email,
				createdAt: firestore.FieldValue.serverTimestamp(),
				userId,
			};

			return db.doc(`users/${newUser.userName}`).set(userCredential);
		})
		.then(() => {
			return res.status(201).json({ authToken });
		})
		.catch((err) => {
			console.log(err);
			if (err.code === 'auth/email-already-in-use') {
				return res.status(400).json({ email: 'Email is already used' });
			} else {
				return res.status(501).json({ error: err.code });
			}
		});
};

exports.login = (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password,
	};

	const { valid, errors } = validateLogin(user);
	if (!valid) return res.status(400).json(errors);

	firebase
		.auth()
		.signInWithEmailAndPassword(user.email, user.password)
		.then((data) => {
			return data.user.getIdToken();
		})
		.then((token) => {
			return res.status(200).json({ token });
		})
		.catch((err) => {
			console.log(err);
			// auth/wrong-password
			// auth/user-not-user
			return res.status(403).json({ error: 'Wrong credentials' });
		});
};

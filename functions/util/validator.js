const isEmail = (email) => {
	const regex =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return email.match(regex) ? true : false;
};

const isEmpty = (string) => {
	return string.trim() === '' ? true : false;
};

exports.validateSignUp = (data) => {
	let errors = {};

	if (isEmpty(data.email)) {
		errors.email = 'email must not be empty';
	} else if (!isEmail(data.email)) {
		errors.email = 'must be a valid email';
	}

	if (isEmpty(data.password)) errors.password = 'Must not be empty';

	if (data.password !== data.confirmPassword)
		errors.confirmPassword = 'Passwords must match';

	if (isEmpty(data.userName)) errors.userName = 'Must not be empty';

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false,
	};
};

exports.validateLogin = (data) => {
	let errors = {};

	if (isEmpty(data.email)) {
		errors.email = 'email must not be empty';
	} else if (!isEmail(data.email)) {
		errors.email = 'must be a valid email';
	}

	if (isEmpty(data.password)) errors.password = 'Must not be empty';

	return {
		errors,
		valid: Object.keys(errors).length === 0 ? true : false,
	};
};

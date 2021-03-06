var User = require('mongoose').model('User'),
	passport = require('passport');

var getErrorMessage = function(err) {
	var message = '';
	return err.toString();
}

exports.renderSignin = function(req, res, next) {
	if (!req.user) {
		res.render('signin', {
			title: 'Sign-in Form',
			messages: req.flash('error') || req.flash('info')
		});
	} else {
		return res.redirect('/');
	}
};

exports.renderSignup = function(req, res, next) {
	if (!req.user) {
		res.render('signup', {
			title: 'Sign-up Form',
			messages: req.flash('error')
		});
	} else {
		return res.redirect('/');
	}
}

exports.signup = function(req, res, next) {
	if (!req.user) {
		var user = new User(req.body);
		var message = null;

		user.provider = 'local';
		console.log('signup');
		
		user.save(function(err) {
			if (err) {
				var message = getErrorMessage(err);
				req.flash('error', message);
				return res.redirect('/signup');
			}
			console.log('call login');
			req.login(user, function(err) {
				console.log('call login done');
				if (err) return next(err);
				return res.redirect('/');
			});
		});
		console.log('save done');

	} else {
		return res.redirect('/');
	}
};

exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

exports.saveOAuthUserProfile = function(req, profile, done) {
	User.findOne({
		provider: profile.provider,
		providerId: profile.providerId
	}, function(err, user) {
		if (err) {
			return done(err);
		} else {
			if (!user) {
				var possibleUsername = profile.username || ((profile.email) ? profile.email.split('@')[0] : '');

				User.findUniqueUsername(possibleUsername, null, function(avaliableUsername) {
					profile.username = avaliableUsername;
					user = new User(profile);
					user.save(function(err) {
						if (err) {
							var message = getErrorMessage(err);
							req.flash('error', message);
							//return res.redirect('/signup');
							return done(err, user);
						}
						return done(err, user);
					});
				});
			} else {
				return done(err, user);
			}
		}
	});
};

exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}
	next();
};




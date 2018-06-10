import path from 'path';
import AES from 'crypto-js/aes';
import User from '../models/user';
import Cart from '../models/cart';
import generateToken from '../services/token-jwt';
import config, {hostUrl} from '../config';
//test
export const userinfo = function (req, res, next) {
    const regId = req.user.registrationId;

    if (!regId || regId.length < 0 || regId == undefined) {
        return res.status(400).send({error: 'Invalid Registration ID.'});
    }

    User.findOne({registrationId: regId})
        .populate({path: 'courses.ref'})
        .exec(function (err, user) {
            if (err) {
                console.log(err);
            }
            else {
                if (user) {
                    return res.json(user);
                }
            }
        });
};

export const signin = function (req, res, next) {
    res.send({token: generateToken(req.user)});
};

export const signout = function (req, res, next) {
    req.session.destroy(function(err) {
        if(err) {
            return res.status(400).send(err);
        }

        req.logout();
        res.send("logout success.");
    });
};

export const signup = function (req, res, next) {
    const registrationId = req.body.registrationId;
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const level = req.body.level;
    const year = req.body.yearOfStudy;
    const specialization = req.body.specialization;
    const files = req.files;
    const userType = req.body.userType;

    if (!email || !password || !name || !registrationId || !year || !specialization || !level || !userType) {
        return res.status(400).send({error: 'Invalid user information.'});
    }

    User.findOne({id: registrationId}, function (err, exists) {
        if (err) {
            return next(err);
        }

        if (exists) {
            return res.status(409).send({error: 'Registation ID is already in use'});
        }

        const encrypted = AES.encrypt(password, config.secret).toString();
        if(encrypted && encrypted.length > 0) {
            let filename = `${hostUrl}/images/anonymous.png`;

            if(files) {
                const avatar = req.files.avatar;
                if(avatar) {
                    const name = avatar.name;
                    const fullpath = path.resolve('wwwroot', '../public/img/', './' + name);

                    avatar.mv(fullpath, function (err) {
                        if (err) {
                            return next(err);
                        }
                    });

                    if(name && name.length > 0) {
                        filename = `${hostUrl}/images/${name}`;
                    }
                }
            }

            const user = new User({
                registrationId: registrationId,
                password: encrypted,
                userType: userType,
                profile: {
                    name: name,
                    email: email,
                    level: level,
                    yearOfStudy: year,
                    specialization: specialization,
                    picture: filename
                }
            });

            user.save(function (err) {
                if (err) {
                    return next(err);
                }

                const cart = new Cart({
                    user: user._id
                });

                cart.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    else {
                        return res.json({token: generateToken(user)});
                    }
                });
            });
        }
    });
};

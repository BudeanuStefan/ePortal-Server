import _ from 'lodash';
import User from '../models/user'
import Course from '../models/course'

export const search = function (req, res, next) {
    const email = req.user.profile.email;
    const registrationId = req.user.registrationId;
    var url = req.headers.referer;
    var previousCourses = false;

    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();

    const user = req.user;

    if (month === 2 && day === 20) {
        user.profile.semester = 2;
        user.save(function (err) {
            if (err) {
                return next(err);
            }
        });
    }

    if (user.profile.level === 'licenta') {
        if (user.profile.yearOfStudy === 1 || user.profile.yearOfStudy === 2) {
            if (month === 10 && day === 1) {
                user.profile.yearOfStudy = user.profile.yearOfStudy + 1;
                user.profile.semester = 1;
                user.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                });
            }
        }
    }

    if (user.profile.level === 'master') {
        if (user.profile.yearOfStudy === 1) {
            if (month === 10 && day === 1) {
                user.profile.yearOfStudy = user.profile.yearOfStudy + 1;
                user.profile.semester = 1;
                user.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                });
            }
        }
    }

    if (url.includes('previous')) {
        previousCourses = true;
    }

    if (!email || email.length < 0) {
        return res.status(400).send({error: 'invalid email.'});
    }

    var courses = "";
    Course.find({}, function(err, result) {
        if (err) throw err;
        console.log(result.size);
        courses = result;
    });

    User.findOne({registrationId: registrationId})
        .populate({
            path: 'courses.ref',
            populate: {
                path: '_authors',
                model: 'Author'
            }
        })
        .exec(function (err, user) {
            if (err) {
                console.log(err);
            }

            if (user) {
                var filtered;
                if (!previousCourses) {
                    filtered = courses.filter(function(elem) {
                        if (elem.level === user.profile.level && elem.yearOfStudy === user.profile.yearOfStudy &&
                            elem.specialization === user.profile.specialization && elem.semester === user.profile.semester) {

                            return elem;
                        };
                    })
                }
                else {
                    filtered = courses.filter(function(elem) {
                        if ((elem.level === user.profile.level)
                            && (elem.specialization === user.profile.specialization)
                            && ((elem.yearOfStudy === user.profile.yearOfStudy - 1)
                            || (elem.semester === user.profile.semester - 1)))  {

                            return elem;
                        };
                    })
                }

                if(filtered.length > 0) {
                    const results = filtered.map(function(elem) {
                        return elem;
                    });

                    return res.json(results);
                }
                else {
                    return res.json([]);
                }
            }
        });
};

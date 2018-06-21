import _ from 'lodash';
import User from '../models/user'
import Course from '../models/course'

export const search = function (req, res, next) {
    const email = req.user.profile.email;
    const registrationId = req.user.registrationId;
    var url= req.headers.referer;
    var previousCourses = false;
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
                            && ((elem.yearOfStudy === user.profile.yearOfStudy) || (elem.yearOfStudy === user.profile.yearOfStudy - 1))
                            && ((elem.semester === user.profile.semester) || (elem.semester === user.profile.semester - 1)))  {

                            return elem;
                        };
                    })
                }

                if(filtered.length > 0) {
                    const results = filtered.map(function(elem) {
                        //return elem.ref;
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

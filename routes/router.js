import fs from 'fs';
import path from 'path';
import * as Authentication from '../controllers/authentication';
import passportLogin from '../services/passport';
import passport from 'passport';
import generateToken from '../services/token-jwt';
import googleStrategy from '../services/google-strategy';
import {clientUrl} from '../config';

passportLogin();

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

googleStrategy();

import * as SearchCourse from '../controllers/search-course';

import * as SearchCart from '../controllers/search-cart';

import * as LectureCourse from '../controllers/lecture-course';

import * as CommentCourse from '../controllers/comment-course';

import * as ViewCourses from '../controllers/view-courses';

export default function(app) {
    app.get('/', requireAuth, function(req, res) {
        res.send({ message: 'Welcome! guest: ' + req.user.profile.name});
    });
    app.get('/token', requireAuth, Authentication.userinfo);
    app.post('/signin', requireSignin, Authentication.signin);
    app.get('/signout', requireAuth, Authentication.signout);
    app.post('/signup', Authentication.signup);

    app.get('/paginate', SearchCourse.paginate);

    app.get('/courses/:keyword', SearchCourse.search);
    app.get('/courses/detail/:id', SearchCourse.searchById);

    app.get('/lecture/:id', LectureCourse.search);
    app.post('/view-lecture', requireAuth, LectureCourse.viewById);

    app.get('/comments', CommentCourse.paginate);
    app.post('/add-comment', requireAuth, CommentCourse.addComment);
    app.post('/remove-comment', requireAuth, CommentCourse.removeComment);
    app.post('/toggle-helpful', requireAuth, CommentCourse.toggleHelpful);

    app.post('/buy-cart', requireAuth, SearchCart.buyCart);
    app.get('/list-cart', requireAuth, SearchCart.listCart);
    app.post('/add-cart', requireAuth, SearchCart.addCart);
    app.post('/remove-cart', requireAuth, SearchCart.removeCart);

    app.get('/view-courses', requireAuth, ViewCourses.search);

    app.get('/auth/google',
        passport.authenticate('google', { scope: ['email profile'] }));

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/signin' }), function(req, res) {
        if(req.user) {
            const token = generateToken(req.user);
            const url = `${clientUrl}/social-google?token=${token}`;
            res.redirect(url);
        }});
};

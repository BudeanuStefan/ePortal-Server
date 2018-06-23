import seedrandom from 'seedrandom';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import morgan from 'morgan';
import mongoose from 'mongoose';
import {Sequence} from './models/sequence';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';

import config from './config';
import router from './routes/router';

import * as SearchCourse from './controllers/search-course';
import * as AuthorCourse from './controllers/author-course';
import * as LectureCourse from './controllers/lecture-course';
import * as UserCourse from './controllers/user-course';
import * as CommentCourse from './controllers/comment-course';
import * as Course from './models/course';

seedrandom();
Math.seedrandom();

const app = express();

mongoose.Promise = require('bluebird');

mongoose.connect(config.database, {useMongoClient: true,
    keepAlive: 300000, connectTimeoutMS: 30000}).then(
    () => {
        console.log("Connected to the database");

        if (process.env.INITDB === "TRUE") {

            var dbo = mongoose.connection;

            dbo.collections.authors.drop(function(err, delOK) {
                if (err) throw err;
                if (delOK) console.log("Collection deleted");
            })

            dbo.collections.courses.drop(function(err, delOK) {
                if (err) throw err;
                if (delOK) console.log("Collection deleted");
            })

            dbo.collections.lectures.drop(function(err, delOK) {
                if (err) throw err;
                if (delOK) console.log("Collection deleted");
            })

        }
        AuthorCourse.buildAuthor();
        SearchCourse.buildCourse();
        LectureCourse.buildLecture();

        AuthorCourse.populate();
        SearchCourse.populate();
        LectureCourse.populate();
    })
    .catch((err) => {
        if (err) {
            console.log(err);
            return handleError(err);
        }
    });

app.use('/public', express.static(__dirname + '/public'));
app.use('/images', express.static(__dirname + '/public/img'));

app.use('/video',function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use('/video', express.static(__dirname + '/public/mp4'));

app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(fileUpload());
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.secret
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user)
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

router(app);

const port = process.env.PORT || config.port;
const server = http.createServer(app);
if(server) {
    server.listen(port, function (err) {
        if (err) {
            console.log(err);
            throw err;
        }

        console.log('Server is Running on port: ', port);
    });
}

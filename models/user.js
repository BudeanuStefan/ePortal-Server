import mongoose from 'mongoose';
import {counter} from './sequence';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema({
    no: Number,
    registrationId: {type: String, unique: true},
    password: {type: String, default: ''},
    userType: {type: String, default: '', lowercase: true},
    profile: {
        name: {type: String, default: ''},
        email: {type: String, default: '', lowercase: true},
        picture: {type: String, default: ''},
        instructor: {type: Boolean, default: false},
        level: {type: String, default: '', lowercase: true},
        yearOfStudy: {type: Number, default: 0},
        specialization: {type: String, default: '', lowercase: true},
        semester: {type: Number, default: 1}
    },
    courses: [{
        ref: { type: ObjectId, ref: 'Course'},
        no: { type: Number, default: 0},
        learn: { type: Boolean, default: false}
    }],
    google: {
        type: Object
    },
    facebook: {
        type: Object
    },
    twitter: {
        type: Object
    }
});

UserSchema.pre('save', function (next) {
    const doc = this;

    const name = 'user_counter';

    counter.findByIdAndUpdate({_id: name}, {$inc: { seq: 1} }, function(err, result) {
        if(err) {
            return next(err);
        }
console.log(result);
        doc.no = result.seq;
        // console.log('{User}:save => [' + doc.no + ']');
        next();
    });
});

export default mongoose.model('User', UserSchema, 'users');

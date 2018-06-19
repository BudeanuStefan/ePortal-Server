import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CourseSchema = new Schema({
    no: {type: Number, unique: true},
    title: {type: String, default: ''},
    subtitle: {type: String, default: ''},
    authors: [{
        no: {type: Number, default: 0},
        name: {type: String, default: ''}
    }],
    _authors: [{type: ObjectId, ref: 'Author'}],
    _comments: [{type: ObjectId, ref: 'Comment'}],
    average: {type: Number, default: 0},
    reviews: {type: Number, default: 0},
    enrolled: {type: Number, default: 0},
    price: {type: Number, default: 0},
    category: {type: String, default: ''},
    specialization: {type: String, default: '', lowercase: true},
    level: {type: String, default: '', lowercase: true},
    yearOfStudy: {type: Number, default: 0},
    semester: {type: Number, default: 1},
    picture: {type: String, default: ''},
    updated: {type: Date, default: Date.now},
    description: {type: String, default: ''}
});

export default mongoose.model('Course', CourseSchema, 'courses');

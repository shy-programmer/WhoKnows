const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    // next();
});

userSchema.methods.isValidPassword = function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('user', userSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minLength: 2,
            match: [/^[\p{L}\s]+$/u, 'Thông tin không hợp lệ.'],
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/.+\@.+\..+/, 'Vui lòng nhập email hợp lệ']
        },
        password: {
            type: String,
            required: true,
            minLength: 8,
            validate: {
                validator: (value) =>
                    /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$/.test(value),
                message:
                    'Mật khẩu không hợp lệ. tối thiểu 8 ký tự trong đó tối thiếu 1 ký tự đặc biệt và 1 ký tự in hoa.',
            },
        },
        role: {
            type: String,
            enum: ['Khách hàng', 'Nhân viên nhập liệu', 'Nhân viên bán hàng', 'Quản trị viên'],
            default: 'Khách hàng'
        },
    },
    {timestamps: true}
);

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
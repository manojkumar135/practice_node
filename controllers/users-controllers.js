const { v4: uuid } = require('uuid')
const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const User = require('../models/user')

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Max',
        email: 'test@test.com',
        password: 'testers'
    }
]



const getUsers = async(req, res, next) => {
    let users
    try{
        users=await User.find({},'-password')

    }
    catch (err){
        const error = new HttpError(`Fetching users failed, please try again later. ${err}`, 500)
        return next(error)
    }
res.json({users:users.map(user=>user.toObject({getters:true}))})


    // res.json({ users: DUMMY_USERS })
}

const signup = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data'))
    }

    const { name, email, password, places } = req.body

    // const hasUser = DUMMY_USERS.find(u => u.email === email)
    // if (hasUser) {
    //     throw new HttpError('Could not create user, email already exists.', 422)
    // }

    let existingUser

    try {
        existingUser = await User.findOne({ email: email })
    }
    catch (err) {
        const error = new HttpError(`Signing up failed, please try again. ${err}`, 500)
        return next(error)
    }

    if (existingUser) {
        const error = new HttpError('User exists already, please login instead', 422)
        return next(error)
    }

    const createdUser = new User({
        name,
        email,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmR7wC4g5ysleyHGBsPLc52IYcFIzn_pXHdNgQE4wURoDVP4lrS16Q_5viOxIiGPyzpak&usqp=CAU',
        password,
        places:[]
    })

    try {
        await createdUser.save()
    }
    catch (err) {
        const error = new HttpError('Signing up failed, please try again.', 500)
        return next(error)
    }

    // const createdUser = {
    //     id: uuid(),
    //     name,
    //     email,
    //     password
    // }
    // DUMMY_USERS.push(createdUser)

    res.status(201).json({ user: createdUser.toObject({ getters: true }) })

}

const login = async (req, res, next) => {
    const { email, password } = req.body

    let existingUser

    try {
        existingUser = await User.findOne({ email: email })
    }
    catch (err) {
        const error = new HttpError(`Logging in failed, please try again later. ${err}`, 500)
        return next(error)
    }
    // const identifiedUser = DUMMY_USERS.find(u => u.email === email)
    // if (!identifiedUser || identifiedUser.password !== password) {
    //     throw new HttpError('Could not identify user, credentials seem to be wrong.', 401)
    // }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError(`Invalid credentials, could not log you in. `, 401)
        return next(error)
    }

    res.json({ message: 'Logged in!' })
}


exports.getUsers = getUsers
exports.signup = signup
exports.login = login
const { v4: uuid } = require('uuid')
const { validationResult } = require('express-validator')
const mongoose = require("mongoose")

const HttpError = require('../models/http-error')
const Place = require('../models/place')
const User = require('../models/user')

let DUMMY = [
    {
        id: "p1",
        title: "Empire State Building",
        description: "One of the most famous sky scrapers in the world!",
        location: {
            lat: 40.7484474,
            lng: -73.9871516,
        },
        address: "20 w 34th st , New York , NY 10001",
        creator: "u1",
    },
];

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place
    try {
        place = await Place.findById(placeId)

    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place.', 500)
        return next(error)
    }

    // const place = DUMMY.find((p) => {
    //     return p.id === placeId;
    // })

    if (!place) {
        throw new HttpError('Could not find a place for the provided id.', 404)
        return next(error)
        // error.code = 404
        // throw error
        // return res.status(404).json({ message: 'Could not find a place for the provided id.' })
    }

    console.log("GET Request in Places");
    res.json({ place: place.toObject({ getters: true }) })
}


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    // let places
    let userWithPlaces
    try {
        userWithPlaces = await User.findById(userId).populate('places')

    } catch (err) {
        const error = new HttpError('Fetching places failed, please try again later', 500)
        return next(error)
    }

    // const places = DUMMY.filter((p) => {
    //     return p.creator === userId;
    // });
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(new HttpError('Could not find places for the provided user id.', 404))

        // const error = new Error('Could not find a place for the provided id.')
        // error.code = 404
        // return next(error)
        // return res.status(404).json({ message: 'Could not find a place for the provided id.' })
    }
    res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // console.log(errors)
        // res.status(422)
        throw new HttpError('Invalid inputs passed, please check your data')
    }

    const { title, description, location, address, creator } = req.body

    const createdPlace = new Place({
        title,
        description,
        address,
        location,
        image: 'https://media-cdn.tripadvisor.com/media/photo-m/1280/1d/99/06/82/gali-gopuram.jpg',
        creator
    })

    let user
    try {
        user = await User.findById(creator)
    }
    catch (err) {
        const error = new HttpError('Creating place failed, Please try again', 500)
        return next(error)
    }
    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404)
        return next(error)
    }
    // console.log(user)


    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await createdPlace.save({ session: sess })
        user.places.push(createdPlace)
        await user.save({ session: sess })
        await sess.commitTransaction()
    }
    catch (err) {
        const error = new HttpError('Creating place failed, Please try again', 500)
        return next(error)
    }

    // DUMMY.push(createdPlace)

    res.status(201).json({ place: createdPlace })
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        //  console.log(errors)
        // res.status(422)
        return next(new HttpError('Invalid inputs passed, please check your data'))
    }

    const { title, description, } = req.body
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId)
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not update place', 500)
        return next(error)
    }

    // const updatedPlace = DUMMY.find(p => p.id === placeId)
    // const placeIndex = DUMMY.find(p => p.id === placeId)
    place.title = title
    place.description = description

    try {
        await place.save()
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not update place.', 500)
        return next(error)
    }

    // DUMMY[placeIndex] = updatedPlace

    res.status(200).json({ place: place.toObject({ getters: true }) })
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid

    let place
    try {
        place = await Place.findById(placeId).populate('creator')
    }
    catch (err) {
        const error = new HttpError('Something went wrong, could not delete place. ', 500)
        return next(error)
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id.', 404)
        return next(error)
    }
    // if (!DUMMY.find(p => p.id === placeId)) {
    //     throw new HttpError('Could not find a place for that id', 404)
    // }

    // DUMMY = DUMMY.filter(p => p.id !== placeId)

    try {
        const sess = await mongoose.startSession()
        sess.startTransaction()
        await place.deleteOne({ session: sess })
        place.creator.places.pull(place)
        await place.creator.save({ session: sess })
        await sess.commitTransaction()
    }
    catch (err) {
        const error = new HttpError(`Something went wrong, could not delete place. ${err}`, 500)
        return next(error)
    }

    res.status(200).json({ message: 'Deleted place.' })
}


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
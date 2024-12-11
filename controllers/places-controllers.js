const { v4: uuid } = require('uuid')
const {validationResult}=require('express-validator')

const HttpError = require('../models/http-error')

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

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY.find((p) => {
        return p.id === placeId;
    })

    if (!place) {
        throw new HttpError('Could not find a place for the provided id.', 404)
        // error.code = 404
        // throw error
        // return res.status(404).json({ message: 'Could not find a place for the provided id.' })
    }

    console.log("GET Request in Places");
    res.json({ place })
}


const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY.filter((p) => {
        return p.creator === userId;
    });
    if (!places || places.length===0) {
        return next(new HttpError('Could not find places for the provided user id.', 404))

        // const error = new Error('Could not find a place for the provided id.')
        // error.code = 404
        // return next(error)
        // return res.status(404).json({ message: 'Could not find a place for the provided id.' })
    }
    res.json({ places });
}

const createPlace = (req, res, next) => {
   const errors= validationResult(req)
   if (!errors.isEmpty()){
    // console.log(errors)
    // res.status(422)
        throw new HttpError('Invalid inputs passed, please check your data')
   }

    const { title, description, coordinates, address, creator } = req.body

    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }
    DUMMY.push(createdPlace)

    res.status(201).json({ place: createdPlace })
}

const updatePlace = (req, res, next) => {
    const errors= validationResult(req)
    if (!errors.isEmpty()){
    //  console.log(errors)
     // res.status(422)
         throw new HttpError('Invalid inputs passed, please check your data')
    }

    const { title, description, } = req.body
    const placeId = req.params.pid

    const updatedPlace = DUMMY.find(p => p.id === placeId)
    const placeIndex = DUMMY.find(p => p.id === placeId)
    updatedPlace.title = title
    updatedPlace.description = description

    DUMMY[placeIndex] = updatedPlace

    res.status(200).json({ place: updatePlace })
}

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid

if (!DUMMY.find(p=>p.id===placeId)){
    throw new HttpError('Could not find a place for that id',404)
}

    DUMMY = DUMMY.filter(p => p.id !== placeId)
    res.status(200).json({message:'Deleted place.'})
}


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
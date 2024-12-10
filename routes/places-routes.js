const express=require('express')

const router=express.Router()

const DUMMY=[
    {id:'p1',
    title:'Empire State Building',
    description:'One of the most famous sky scrapers in the world!',
    location:{
        lat:40.7484474,
        lng:-73.9871516
    },
    address:'20 w 34th st , New York , NY 10001',
    creator:'u1'
    }
]

router.get('/:pid',(req,res,next)=>{
    const placeId=req.params.pid
    const place=DUMMY.find(p=>{
        return p.id===placeId
    })
    console.log('GET Request in Places')
    res.json({
        place
    })
})

module.exports=router
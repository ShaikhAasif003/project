const express = require("express");
const app = express();
const mongoose = require("mongoose")
const Listing = require("./models/listing.js") 
const path = require("path")
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js")
const expressError = require("./utils/expressError.js")
const {listingSchema} = require("./schema.js")
 

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

main().then(() => {
    console.log("connected to DB")
}).catch(err => {
    console.log(err)
})
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  }
app.get("/", (req,res) => {
   res.send("app is working")
})
const validateListing = (req ,res, next) => {
    let {error} = listingSchema.validate(req.body)
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new expressError(400, errMsg)
    }else{
        next()
    }
}

//index Route
app.get("/listing",  wrapAsync(async (req,res) => {
 const allListings = await  Listing.find({})
 res.render("listings/index.ejs",{allListings})
}))

//new Route
app.get("/listing/new",  (req,res) => {
    res.render("listings/new.ejs",)
})

//show Route
app.get("/listing/:id", wrapAsync( async (req,res) => {
   let {id} = req.params;
 const listing = await  Listing.findById(id);
 res.render("listings/show.ejs",{listing})
}))

//create Route
app.post("/listing", validateListing, wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing)
        await newListing.save()
        res.redirect("/listing")   
}))

//edit Route
app.get("/listing/:id/edit",  wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await  Listing.findById(id);
    res.render("listings/edit.ejs",{ listing })
}))

//update Route
app.put("/listing/:id", validateListing, wrapAsync(async (req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing});
    res.redirect(`/listing/${id}`)
}))

//Delete Route
app.delete("/listing/:id",  wrapAsync(async (req,res) => {
    let { id } = req.params;
  let delitedListing =  await Listing.findByIdAndDelete(id);
  console.log(delitedListing)
  res.redirect("/listing")
}))

// app.get("/testListing", async (req,res) => {
//     let sampleListing = new Listing({
//         title:"welcome to my new villa",
//         description:"by the beach",
//         price:1500,
//         location: "calangute , Goa",
//         country: "india"
//     })
//     await sampleListing.save();
//     console.log("sample was save")
//     res.render("successful testing")
// })

app.all("*",(req,res,next) => {
    next(new expressError(404,"page not found!"))
})

app.use((err,req,res,next) => {
    let {statusCode = 500,message = "somthing went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message})
    // res.status(statusCode = 500).send(message = "somthing went wrong")
})
app.listen(8080,() => {
    console.log("app is listening to port 8080")
})
const express = require("express");
const app = express();
const mongoose = require("mongoose")
const Listing = require("./models/listing.js") 
const path = require("path")
const methodOverride = require('method-override');


app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));

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


//index Route
app.get("/listing", async (req,res) => {
 const allListings = await  Listing.find({})
 res.render("listings/index.ejs",{allListings})
})

//new Route
app.get("/listing/new",  (req,res) => {
    res.render("listings/new.ejs",)
})

//show Route
app.get("/listing/:id", async (req,res) => {
   let {id} = req.params;
 const listing = await  Listing.findById(id);
 res.render("listings/show.ejs",{listing})
})

//create Route
app.post("/listing", async (req,res) => {
    const newListing = new Listing(req.body.listing)
    await newListing.save()
    res.redirect("/listing")
})

//edit Route
app.get("/listing/:id/edit", async (req,res) => {
    let {id} = req.params;
    const listing = await  Listing.findById(id);
    res.render("listings/edit.ejs",{ listing })
})

//update Route
app.put("/listing/:id", async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing});
    res.redirect("/listings")
})

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
app.listen(8080,() => {
    console.log("app is listening to port 8080")
})
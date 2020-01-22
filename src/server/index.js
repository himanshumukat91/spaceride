require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        console.log(process.env.API_KEY);
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
});

app.get('/rover/:name/:page', async (req, res) => {
    try {
        // console.log(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.name}/photos?sol=${req.params.page}&api_key=${process.env.API_KEY}`);
        let data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.name}/photos?sol=${req.params.page}&api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        res.send(getRoverDetails(data));
    } catch (err) {
        console.log('error:', err);
    }
});

const getRoverDetails = (data) => {
    const photos = data.photos;

    if(!photos.length) return {error: 'photos not found for this sol'};
    
    const rover = photos[0].rover;
    let roverDetails = {        
        name: rover.name,
        landing_date: rover.landing_date,
        launch_date: rover.launch_date,
        status: rover.status,
        max_sol: rover.max_sol,
        max_date: rover.max_date,
        total_photos: rover.total_photos,
        images: [],
    };

    roverDetails.images = photos.map(photo => {
        return {
            url: photo.img_src || '',
            camera: photo.camera.full_name,
        }
    });
    return roverDetails;
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
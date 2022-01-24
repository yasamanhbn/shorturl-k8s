
const express = require('express')
const shortid = require('shortid')
const Url = require('./models/Url')
const mongoose = require('mongoose')

const data = require('./app/config/config.json')


const app = express()

const baseUrl = 'localhost:' + data.port
app.use(express.urlencoded({ extended: false }));


app.get('/', async (req, res) => {
    try {
        const url = await Url.findOne({
            urlCode: req.query.url
        })
        if (url) {
            // when valid we perform a redirect
            var date1 = new Date(url.date);
            var date2 = new Date();
            var time = (date2 - date1) / 1000;
            if (time < data.expireTime) {
                res.redirect('https://'+url.longUrl)
            }
            else {
                await Url.deleteOne({
                    urlCode: req.query.url
                })
                return res.status(404).json('expired')
            }
        } else {
            // else return a not found 404 status
            return res.status(404).json('No URL Found')
        }

    }
    // exception handler
    catch (err) {
        console.error(err)
        res.status(500).json('Server Error')
    }
})


app.post('/post-url', async (req, res) => {
    const longUrl = req.body.url;
    const urlCode = shortid.generate()
    try {
        let url = await Url.findOne({
            longUrl
        })
        if (url) {
            await Url.deleteOne({
                longUrl: longUrl
            })
        }
        const shortUrl = baseUrl + '?url=' + urlCode
        // invoking the Url model and saving to the DB
        url = new Url({
            longUrl,
            shortUrl,
            urlCode,
            date: new Date()
        })
        await url.save()
        res.json(url.shortUrl)
    }
    catch (err) {
        console.log(err)
        res.status(500).json('Server Error')
    }
});


mongoose.connect(data.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true ,
    user: data.user,
    pass: data.pwd
})

const connection = mongoose.connection
connection.once('open', () => console.log('DB Connected'))
connection.on('error', () => console.log('Error'))
app.listen(data.port);
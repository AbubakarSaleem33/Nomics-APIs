const axios = require('axios')
const express = require('express')
const app = express()

const Datastore = require('nedb')
const db = new Datastore({ filename: 'nomics.db', autoload: true })

const nomicsKey = 'c38eac6daa61ad3cf7ee2b882e8c54581b6a885a'

app.use(express.json({ limit: '50mb' }));         //parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true }))     //recognize the incoming Request Object as strings or arrays
//YOU NEED BOTH OF THESE IN ORDER TO POST/PATCH/PUT DATA
// axios
//     .get("https://api.nomics.com/v1/currencies/ticker?key=" + nomicsKey + "&ids=BTC,ETH,XRP&interval=1d,30d&convert=EUR&per-page=100&page=1")
//     .then(response => console.log(response))

async function getDataFromNomics(coinIds) {
    try {
        res = await axios.get("https://api.nomics.com/v1/currencies/ticker?key=" + nomicsKey + "&ids=" + coinIds + "&interval=1d,30d&convert=EUR&per-page=100&page=1")
        //console.log(res.data.map(x => x.logo_url))
        return res.data.map(x => x.id)
    }
    catch (error) {
        console.log("There was an error")
    }
}

app.post('/nomics/:id', async (req, res) => {
    try {
        const coinId = req.params.id
        let insertData = await getDataFromNomics(coinId)
        console.log(insertData[0])
        db.insert({ "data": insertData[0] }, async (error, addedData) => {
            if (error) {
                res.send(error)
            }
            return res.send(addedData)
        })
    }
    catch (error) {
        return res.send(error)
    }
})

app.get('/', async (req, res) => {
    try {
        db.find({}).exec(function (error, data) {
            if (error) {
                res.send(error)
            }
            res.send(data)
        })
    }
    catch (error) {
        return res.send(error)
    }
})

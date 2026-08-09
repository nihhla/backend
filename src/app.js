const express = require('express')
// const routes = require('./routes')
const cors = require('cors')

const app = express()
const errorMiddleware = require('./middleware/error.middleware')

app.use(cors())

app.use(express.json({
    origin: '*',
    creditials: false,
}));

app.get('/', (req, res)=> {
    res.send('api working')
})

app.use(errorMiddleware)

module.exports = app
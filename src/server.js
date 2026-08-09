const app = require('./app')
const PORT = process.env.PORT || 3000
const connectDB = require('./config/db')

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error(err)
    })
require('dotenv').config()
const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser');
// const { sequelize } = require('../db/models');
const errorMiddleware = require('./middlewares/error-middleware')




const router = require('./router/index')

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors())


app.use('/api',router)
app.use(errorMiddleware)

const PORT = process.env.PORT

const start = async () => {
    try {
        app.listen(PORT,()=>{
            console.log(`Server listening on port ${PORT}`);
        });

    } catch (error) {
        console.log(error);
    }
}
start()
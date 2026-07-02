import express from 'express'
import cors from 'cors'
import login from './routes/login.routes.js'

import mydb from './cofig/db.js'

const app = express();

app.use(cors())
app.use(express.json());
app.use('/api',login)
mydb()

const port=5000;

app.listen(port, () => {
    console.log(`app is running on port 5000`);
});
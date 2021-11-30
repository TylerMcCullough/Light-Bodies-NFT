const express = require('express')
require('dotenv').config()

const app = express()
const port = 3000
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Running on ImmutableX!'))

app.use('/api/v1/user',userRouter)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./config/db')

// connect database
connectDB();


app.get('/', (req, res) => res.send('API running'))
// Init middleware
app.use(express.urlencoded({extended:true}))
app.use(express.json({extended:false}))

// Define Routes
app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/users',require('./routes/api/users'))
app.use('/api/profile',require('./routes/api/profile'))
app.use('/api/posts',require('./routes/api/posts'))

app.listen(port,()=>console.log("Server running at port",port))
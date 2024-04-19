import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';


dotenv.config({ path: './src/config/config.env'});

// Route files
import golfballs from './routes/golfball.js';
import user from './routes/user.js';
import game from './routes/game.js';
import room from './routes/room.js';

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Define routes
app.use('/api/golfballs', golfballs);
app.use('/api/user', user);
app.use('/api/game', game);
app.use('/api/room', room);

const PORT = process.env.PORT || 3222;

// Start server
const server = app.listen(PORT, () => console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));
process.on('unhandledRejection', (err, promise)=>{
    console.log(`Error: ${err.message}`);

    server.close(()=> process.exit(1));
})

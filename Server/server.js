const app = require('./app')
const { connectDB } = require('./db');

const PORT = process.env.HOSTPORT;

connectDB();


app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
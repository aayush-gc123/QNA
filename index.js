// const express = require('express');
// const bodyParser = require('body-parser');
// const session = require('express-session');
// const bcrypt = require('bcrypt');
 
// const app = express();
// const PORT = 3000;
// const SALT_ROUNDS = 10;

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(session({
//   secret: 'secret-key',
//   resave: false,
//   saveUninitialized: true
// }));

// app.set('view engine', 'ejs');

// let users = [];
// let questions = [];

// app.get('/', (req, res) => {
//   res.render('landing');
// });
                
// app.get('/main', (req, res) => {
//   if (!req.session.username) {
//     return res.redirect('/');
//   }
//   res.render('index', { questions, session: req.session });
// });
        
// app.get('/register', (req, res) => {
//   res.render('register');
// });

// app.post('/register', async (req, res) => {
//   const { username, password } = req.body;
//   const userExists = users.some(user => user.username === username);
//   if (userExists) {
//     return res.send('Username already taken');
//   }
//   const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
//   users.push({ username, password: hashedPassword });
//   res.redirect('/login');
// });

// app.get('/login', (req, res) => {
//   res.render('login');
// });

// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   const user = users.find(u => u.username === username);
//   if (user && await bcrypt.compare(password, user.password)) {
//     req.session.username = username;
//     res.redirect('/main');
//   } else {
//     res.render('login', { error: 'Invalid username or password' });
//   }
// });

// app.get('/ask', (req, res) => {
//   if (!req.session.username) {
//     return res.redirect('/login');
//   }
//   res.render('ask', { session: req.session });
// });

// app.post('/ask', (req, res) => {
//   const { question } = req.body;
//   questions.push({ question, answers: [], askedBy: req.session.username });
//   res.redirect('/main');
// });

// app.get('/answer/:id', (req, res) => {
//   if (!req.session.username) {
//     return res.redirect('/login');
//   }
//   const questionId = req.params.id;
//   const question = questions[questionId];
//   res.render('answer', { question, id: questionId, session: req.session });
// });

// app.post('/answer/:id', (req, res) => {
//   const { answer } = req.body;
//   const questionId = req.params.id;
//   questions[questionId].answers.push({ answer, answeredBy: req.session.username });
//   res.redirect('/main');
// });

// app.get('/logout', (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.redirect('/main');
//     }
//     res.redirect('/');
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });



const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/qnaSite';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Define User schema and model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    category: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/login', async (req, res) => {
    const { name, password } = req.body;
    const user = await User.findOne({ name, password });
    if (user) {
        req.session.username = user.name;
        res.redirect('/');
    } else {
        res.send('Invalid username or password. <a href="/login">Try again</a>');
    }
});

app.post('/signup', async (req, res) => {
    const { name, password, category } = req.body;
    const newUser = new User({ name, password, category });
    await newUser.save();
    res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/', (req, res) => {
    if (req.session.username) {
        res.render('index', { username: req.session.username });
    } else {
        res.render('landing');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory product list
let items = [];
let completedItems = [];
let id = 0;

// Routes
app.get('/', (req, res) => {
    res.render('index', { items, errors: [] });
});

app.post('/add-item', [
    check('task').notEmpty().withMessage('Task is required'),
    check('date').notEmpty().withMessage('Date is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('index', { items, errors: errors.array() });
    }
    const { task, date, desc } = req.body;
    items.push({ task, date, desc, id });
    id = id + 1;
    res.redirect('/');
});

app.post('/mark-completed', (req, res) => {
    const { taskId } = req.body;
    const taskIndex = items.findIndex(item => item.id === parseInt(taskId));
    if (taskIndex !== -1) {
        const completedTask = items.splice(taskIndex, 1)[0];
        completedItems.push(completedTask);
    }
    res.redirect('/completed-tasks');
});

app.get('/completed-tasks', (req, res) => {
    res.render('completed', { completedItems });
});

app.get('/pending-tasks', (req, res) => {
    res.render('pending', { items });
});

// 404 Error handling
app.use((req, res, next) => {
    res.status(404).render('error');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

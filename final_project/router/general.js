const express = require('express');
const axios = require('axios');

const users = require('./auth_users.js').users;
const isValid = require('./auth_users.js').isValid;

const public_users = express.Router();

const BOOK_API = 'http://localhost:5000/api/books';

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: 'User already exists'
        });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(201).json({
        message: 'User registered successfully'
    });
});

// Get all books using Axios and async/await
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(BOOK_API);

        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books'
        });
    }
});

// Get book by ISBN using Axios
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        const response = await axios.get(BOOK_API);

        const book = response.data[isbn];

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve book'
        });
    }
});

// Get books by author using Axios
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author.toLowerCase();

        const response = await axios.get(BOOK_API);

        const result = Object.values(response.data).filter(book =>
            book.author.toLowerCase() === author
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books'
        });
    }
});

// Get books by title using Axios
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title.toLowerCase();

        const response = await axios.get(BOOK_API);

        const result = Object.values(response.data).filter(book =>
            book.title.toLowerCase() === title
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books'
        });
    }
});

// Get reviews for a book
public_users.get('/review/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        const response = await axios.get(BOOK_API);

        const book = response.data[isbn];

        if (!book) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(book.reviews);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve reviews'
        });
    }
});

module.exports.general = public_users;
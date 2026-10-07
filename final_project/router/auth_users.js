const express = require('express');
const jwt = require('jsonwebtoken');

let books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

const JWT_SECRET = 'fingerprint_customer';

// Check whether username already exists
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username &&
        user.password === password
    );
};

// Login - only registered users can login
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const token = jwt.sign(
        { username: username },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return res.status(200).json({
        message: 'Login successful',
        token: token
    });
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user;
    const { review } = req.body;

    if (!username) {
        return res.status(401).json({
            message: 'Authentication required'
        });
    }

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (!review) {
        return res.status(400).json({
            message: 'Review is required'
        });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: 'Review added/updated successfully',
        reviews: books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user;

    if (!username) {
        return res.status(401).json({
            message: 'Authentication required'
        });
    }

    if (!books[isbn]) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (
        !books[isbn].reviews ||
        !books[isbn].reviews[username]
    ) {
        return res.status(404).json({
            message: 'Review not found'
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: 'Review deleted successfully'
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
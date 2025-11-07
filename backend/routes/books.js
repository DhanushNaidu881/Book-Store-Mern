const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// Create a new book (Admin)
router.post("/", async (req, res) => {
  try {
    const { title, author, price, quantity, description, image } = req.body;

    // Validation: Ensure all required fields are present
    if (!title || !author || !price || !quantity || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Additional validation for price and quantity to be non-negative
    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }
    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a book by ID (Admin)
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a book by ID (Admin)
router.put("/:id", async (req, res) => {
  try {
    const { title, author, price, quantity, description, image } = req.body;

    // Validation: Ensure all required fields are present
    if (!title || !author || !price || !quantity || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Additional validation for price and quantity to be non-negative
    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }
    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    // Ensure book exists before updating
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a book by ID (Admin)
router.delete("/:id", async (req, res) => {
  try {
    // Ensure book exists before deleting
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

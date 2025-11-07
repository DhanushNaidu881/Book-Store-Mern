import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Navigate } from "react-router-dom";

const AdminForm = () => {
  const { id } = useParams();
  const defaultUrl = "http://localhost:5000";

  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    price: "",
    quantity: "",
    description: "",
    image: "",
  });

  const [errors, setErrors] = useState({
    title: "",
    author: "",
    description: "",
    image: "",
  });

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchBookData = async () => {
      if (id) {
        const res = await axios.get(`${defaultUrl}/api/books/${id}`);
        setBookData(res.data);
      }
    };
    fetchBookData();
  }, [id]);

  // Detect gibberish
  const isGibberish = (text) => {
    if (!/[aeiouAEIOU]/.test(text)) return true;
    if (/[^a-zA-Z0-9.,'"\s-]/.test(text)) return true;
    if (text.trim().length < 3) return true;
    const consonantClusters = text.match(/[^aeiou\s]{5,}/gi);
    return consonantClusters && consonantClusters.length > 0;
  };

  // ✅ FIXED: Allow Bing, Unsplash, and other valid image URLs (even with ? and & params)
  const isValidImageUrl = (url) => {
    const pattern =
      /^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i;
    const patternLoose = /^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|avif|svg)?(\?.*)?$/i;
    // Allow if ends with valid extension OR contains ?pid=ImgDet or typical Bing/Unsplash pattern
    return (
      pattern.test(url.trim()) ||
      patternLoose.test(url.trim()) ||
      /bing\.com|unsplash\.com|pixabay\.com|googleusercontent\.com/i.test(url)
    );
  };

  // Handle change + validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === "author") cleanValue = value.replace(/[^A-Za-z.\s]/g, "");

    setBookData((prev) => ({ ...prev, [name]: cleanValue }));

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (name === "title") {
        if (cleanValue.trim().length < 3)
          newErrors.title = "Title is too short!";
        else if (isGibberish(cleanValue))
          newErrors.title = "Please enter a meaningful title!";
        else newErrors.title = "";
      }

      if (name === "author") {
        if (cleanValue.trim().length < 3)
          newErrors.author = "Author name is too short!";
        else if (isGibberish(cleanValue))
          newErrors.author = "Please enter a valid author name!";
        else newErrors.author = "";
      }

      if (name === "description") {
        if (cleanValue.trim().length < 10)
          newErrors.description = "Description must be at least 10 characters!";
        else if (isGibberish(cleanValue))
          newErrors.description = "Please enter a proper English description!";
        else newErrors.description = "";
      }

      if (name === "image") {
        if (!cleanValue.trim())
          newErrors.image = "Image URL cannot be empty!";
        else if (!isValidImageUrl(cleanValue))
          newErrors.image =
            "Please enter a valid image URL (e.g. from Bing, Unsplash, etc.)";
        else newErrors.image = "";
      }

      return newErrors;
    });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasError = Object.values(errors).some((err) => err !== "");
    if (hasError) {
      alert("Please fix all errors before submitting!");
      return;
    }

    try {
      if (id) {
        await axios.put(`${defaultUrl}/api/books/${id}`, bookData);
        alert("Book updated successfully!");
      } else {
        await axios.post(`${defaultUrl}/api/books`, bookData);
        alert("Book added successfully!");
      }
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Error saving book");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md -mt-28">
        <h1 className="text-3xl font-bold mb-4 text-center">
          {id ? "Edit Book" : "Add Book"}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={bookData.title}
            onChange={handleChange}
            className={`border p-2 mb-2 w-full ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

          {/* Author */}
          <input
            type="text"
            name="author"
            placeholder="Author"
            value={bookData.author}
            onChange={handleChange}
            className={`border p-2 mb-2 w-full ${
              errors.author ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.author && (
            <p className="text-red-500 text-sm">{errors.author}</p>
          )}

          {/* Price */}
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={bookData.price}
            onChange={handleChange}
            className="border p-2 mb-4 w-full"
            min="0"
          />

          {/* Quantity */}
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={bookData.quantity}
            onChange={handleChange}
            className="border p-2 mb-4 w-full"
            min="1"
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Description"
            value={bookData.description}
            onChange={handleChange}
            rows="3"
            className={`border p-2 mb-2 w-full ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}

          {/* Image URL */}
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={bookData.image}
            onChange={handleChange}
            className={`border p-2 mb-2 w-full ${
              errors.image ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.image && (
            <p className="text-red-500 text-sm mb-2">{errors.image}</p>
          )}

          {/* ✅ Live Image Preview */}
          {bookData.image && isValidImageUrl(bookData.image) && (
            <img
              src={bookData.image}
              alt="Preview"
              className="w-full h-48 object-cover rounded mb-4 border"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}

          <button
            type="submit"
            disabled={Object.values(errors).some((err) => err !== "")}
            className={`py-2 px-4 rounded w-full text-white ${
              Object.values(errors).some((err) => err !== "")
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {id ? "Update Book" : "Add Book"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminForm;

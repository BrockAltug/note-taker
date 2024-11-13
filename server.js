const fs = require("fs"); // Module to handle file operations
const express = require("express"); // Framework for building the server
const path = require("path"); // Module for working with file paths
const { v4: uuidv4 } = require("uuid"); // Utility for generating unique IDs

const app = express(); // Create an Express instance
const PORT = process.env.PORT || 3001; // Define the server port

// Middleware for serving static files and parsing request bodies
app.use(express.static("public")); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to serve the notes page
app.get("/notes", (req, res) => 
  res.sendFile(path.join(__dirname, "public/notes.html"))
);

// API route to fetch all notes
app.get("/api/notes", (req, res) => {
  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }
    res.json(JSON.parse(data)); // Send parsed notes as JSON
  });
});

// API route to add a new note
app.post("/api/notes", (req, res) => {
  const newNote = {
    id: uuidv4(), // Assign a unique ID to the new note
    title: req.body.title,
    text: req.body.text,
  };

  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }

    const notes = JSON.parse(data); // Parse the existing notes
    notes.push(newNote); // Add the new note

    try {
      fs.writeFileSync(
        path.join(__dirname, "db/db.json"),
        JSON.stringify(notes, null, 2), // Write updated notes to the file
        "utf8"
      );
      res.json(newNote); // Respond with the newly created note
    } catch (err) {
      return res.status(500).json({ error: "Failed to save note" });
    }
  });
});

// API route to delete a note by ID
app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id; // Extract the note ID from the request

  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }

    const notes = JSON.parse(data);
    const updatedNotes = notes.filter((note) => note.id !== noteId); // Remove the specified note

    try {
      fs.writeFileSync(
        path.join(__dirname, "db/db.json"),
        JSON.stringify(updatedNotes, null, 2), // Write updated notes back to the file
        "utf8"
      );
      res.json({ message: "Note deleted successfully" });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete note" });
    }
  });
});

// Catch-all route to serve the homepage
app.get("*", (req, res) => 
  res.sendFile(path.join(__dirname, "public/index.html"))
);

// Start the server and listen on the defined port
app.listen(PORT, () => 
  console.log(`Note-Pad app listening at http://localhost:${PORT}`)
);
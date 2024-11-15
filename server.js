const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const cors = require('cors'); // Make sure to require cors if you're using it

const app = express();

// Enable CORS for all origins (useful if your frontend is running on a different port)
app.use(cors());

app.use(bodyParser.json());

async function initialize() {
    try {
        await oracledb.createPool({
            user: 'system',
            password: 'Rachit1!',
            connectString: 'localhost:1521/XEPDB1'
        });
        console.log('Database connected');
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

// Define the route for saving GPA to StudentGPA table
app.post('/save-gpa', async (req, res) => {
    const { studentName, semester, gpa } = req.body;

    console.log("Received request body:", req.body); // Log the entire request body

    if (!studentName || !semester || gpa === null || isNaN(gpa)) {
        return res.status(400).send('Valid studentName, semester, and GPA are required');
    }

    try {
        const connection = await oracledb.getConnection();

        const result = await connection.execute(
            `INSERT INTO StudentGPA (student_name, semester, gpa)
             VALUES (:studentName, :semester, :gpa)`,
            [studentName, semester, gpa],
            { autoCommit: true }
        );

        console.log("Insertion result:", result);
        await connection.close();

        res.status(200).send('Data saved successfully');
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Error saving data');
    }
});

// Define the route for adding a subject to StudentSub table
// Define the route for adding a subject to StudentSub table
app.post('/add-subject', async (req, res) => {
    const { studentName, semester, subjectName, grade, credits } = req.body;

    if (!studentName || !semester || !subjectName || !grade || !credits) {
        return res.status(400).send('Valid studentName, semester, subjectName, grade, and credits are required');
    }

    try {
        const connection = await oracledb.getConnection();

        const result = await connection.execute(
            `INSERT INTO StudentSub (student_name, semester, subject_name, grade, credits)
         VALUES (:studentName, :semester, :subjectName, :grade, :credits)`,
            [studentName, semester, subjectName, grade, credits],
            { autoCommit: true }
        );

        console.log("Subject insertion result:", result);
        await connection.close();

        res.status(200).send('Subject added successfully');
    } catch (err) {
        console.error('Error adding subject:', err);
        res.status(500).send('Error adding subject');
    }
});

// Initialize the OracleDB connection pool
initialize();

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

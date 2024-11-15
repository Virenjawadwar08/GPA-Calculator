import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [studentName, setStudentName] = useState('');
  const [semester, setSemester] = useState('');
  const [displayedStudentName, setDisplayedStudentName] = useState('');
  const [displayedSemester, setDisplayedSemester] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: '', grade: '', credits: '' });
  const [gpa, setGpa] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  // Grade point mapping
  const gradePoints = {
    'S': 10,
    'A': 9,
    'B': 8,
    'C': 7,
    'D': 6,
    'E': 5,
    'F': 0,
  };

  // Trigger API call when GPA, displayedStudentName, and displayedSemester change
  useEffect(() => {
    if (gpa !== null && displayedStudentName && displayedSemester) {
      handleStoreData();
    }
  }, [gpa, displayedStudentName, displayedSemester]);

  // Handle input change for the current subject being added or edited
  const handleNewSubjectChange = (field, value) => {
    setNewSubject({
      ...newSubject,
      [field]: value,
    });
  };

  // Add or update a subject
  const handleAddOrUpdateSubject = async () => {
    if (newSubject.name && newSubject.grade && newSubject.credits) {
      if (editIndex !== null) {
        // Update subject
        const updatedSubjects = [...subjects];
        updatedSubjects[editIndex] = newSubject;
        setSubjects(updatedSubjects);
        setEditIndex(null);
      } else {
        // Add new subject
        setSubjects([...subjects, newSubject]);
  
        // Send new subject to backend to add to StudentSub table
        try {
          const response = await fetch('http://localhost:5001/add-subject', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studentName,
              semester,
              subjectName: newSubject.name,
              grade: newSubject.grade,
              credits: newSubject.credits,
            }),
          });
  
          if (response.ok) {
            console.log('Subject added successfully');
          } else {
            console.log('Error adding subject');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
      setNewSubject({ name: '', grade: '', credits: '' });
    }
  };
  
  
  

  // Delete a subject
  const handleDeleteSubject = (index) => {
    const updatedSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(updatedSubjects);
  };

  // Edit a subject
  const handleEditSubject = (index) => {
    setNewSubject(subjects[index]);
    setEditIndex(index);
  };

  // Calculate GPA
  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach(({ grade, credits }) => {
      const points = gradePoints[grade];
      const creditHours = parseFloat(credits);

      if (!isNaN(points) && !isNaN(creditHours)) {
        totalPoints += points * creditHours;
        totalCredits += creditHours;
      }
    });

    const calculatedGPA = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;
    setGpa(calculatedGPA);  // This will now trigger handleStoreData through useEffect
    setDisplayedStudentName(studentName);
    setDisplayedSemester(semester);
  };

  // Send data to backend API to store in database
  const handleStoreData = async () => {
    try {
      const response = await fetch('http://localhost:5001/save-gpa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: displayedStudentName,
          semester: displayedSemester,
          gpa,
        }),
      });

      if (response.ok) {
        console.log('Data saved successfully');
      } else {
        console.log('Error saving data');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Clear inputs after data is saved
      setStudentName('');
      setSemester('');
    }
  };

  return (
    <div className="container">
      <h2>GPA Calculator</h2>

      <div className="input-field">
        <label>Student Name</label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Enter student name"
          required
        />
      </div>

      <div className="input-field">
        <label>Semester</label>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          required
        >
          <option value="">Select Semester</option>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
            <option key={sem} value={sem}>{`Semester ${sem}`}</option>
          ))}
        </select>
      </div>

      <div className="input-field">
        <h3>Subject Details</h3>
        <label>Subject Name</label>
        <input
          type="text"
          value={newSubject.name}
          onChange={(e) => handleNewSubjectChange('name', e.target.value)}
          placeholder="Enter subject name"
          required
        />
        <label>Grade</label>
        <select
          value={newSubject.grade}
          onChange={(e) => handleNewSubjectChange('grade', e.target.value)}
          required
        >
          <option value="">Select Grade</option>
          {Object.keys(gradePoints).map((grade) => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
        <label>Credits</label>
        <input
          type="number"
          placeholder="Credits"
          value={newSubject.credits}
          onChange={(e) => handleNewSubjectChange('credits', e.target.value)}
          required
        />
      </div>

      <button className="add-btn" onClick={handleAddOrUpdateSubject}>
        {editIndex !== null ? "Update Subject" : "Add Subject"}
      </button>
      <button onClick={calculateGPA} style={{ marginLeft: '10px' }}>
        Calculate GPA
      </button>

      <div className="table-container">
        {studentName && (
          <table className="subjects-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Subject Name</th>
                <th>Grade</th>
                <th>Credits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={index}>
                  <td>{studentName}</td>
                  <td>{subject.name}</td>
                  <td>{subject.grade}</td>
                  <td>{subject.credits}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEditSubject(index)}>Edit</button>
                      <button onClick={() => handleDeleteSubject(index)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {gpa !== null && (
        <div className="gpa-result">
          <h3>Student: {displayedStudentName}</h3>
          <h4>Semester: {displayedSemester}</h4>
          <h3>Your GPA: {gpa}</h3>
        </div>
      )}
    </div>
  );
}

export default App;

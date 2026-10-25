import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import axios from "axios";

import { Modal, Button, Form, InputGroup, Container } from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

import Pagination from "../../components/Pagination";

const apiUrl = import.meta.env.VITE_API_URL;

function StudentList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [show, setShow] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  // Filter and search
  const [filterBy, setFilterBy] = useState("firstName");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Loading state
  const [loading, setLoading] = useState(false);

  const limit = 20;

  const token = localStorage.getItem("token");

  // Fetch students
  useEffect(() => {
    let isMounted = true;

    const getStudents = async () => {
      try {
        setLoading(true);

        const result = await axios.get(`${apiUrl}/students`, {
          params: {
            filterBy,
            search: searchTerm,
            page: currentPage,
            limit,
          },
        });

        if (isMounted && result.data.success) {
          setStudents(result.data.data);

          if (result.data.pagination) {
            setTotalPages(result.data.pagination.totalPages);
            setTotalRecords(result.data.pagination.totalRecords);
          }
        }
      } catch (error) {
        console.error(
          "Error fetching students:",
          error.response?.data?.message || error.message,
        );

        if (isMounted) {
          setStudents([]);
          setTotalPages(1);
          setTotalRecords(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getStudents();

    return () => {
      isMounted = false;
    };
  }, [filterBy, searchTerm, currentPage, isDelete]);

  // Filter selection
  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
    setCurrentPage(1);
  };

  // Search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Close success modal and refresh students
  const handleClose = () => {
    setShow(false);
    setIsDelete((prev) => !prev);
  };

  // Navigate to Add Student
  const goToAddStudentPage = () => {
    navigate("/add/student");
  };

  // Navigate to Edit Student
  const goToEdit = (id) => {
    navigate("/edit/student/" + id);
  };

  // Navigate to Student Profile
  const goToView = (id) => {
    navigate("/student/profile/" + id);
  };

  // Delete Student
  const goToDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmed) return;

    try {
      const result = await axios.delete(`${apiUrl}/delete/student/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.data.success) {
        setShow(true);
      }
    } catch (error) {
      console.error(
        "Error deleting student:",
        error.response?.data?.message || error.message,
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete student. Please try again.",
      );
    }
  };

  const filterLabels = {
    firstName: "first name",
    lastName: "last name",
    enrollmentNumber: "enrollment number",
    rollNumber: "roll number",
    fileNumber: "file number",
    course: "course name",
    branch: "branch name",
    year: "year",
  };

  return (
    <Container>
      {/* Heading */}
      <h3 className="text-center mb-4 py-2 text-primary fw-bold text-danger">
        LIST OF STUDENTS
      </h3>

      {/* Filter and Search */}
      <div className="row g-2 align-items-center mb-3">
        <div className="col-md-4">
          <Form.Select
            value={filterBy}
            onChange={handleFilterChange}
            aria-label="Select student filter"
          >
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="enrollmentNumber">Enrollment Number</option>
            <option value="rollNumber">Roll Number</option>
            <option value="fileNumber">File Number</option>
            <option value="course">Course</option>
            <option value="branch">Branch</option>
            <option value="year">Year</option>
          </Form.Select>
        </div>

        <div className="col-md-8">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>

            <Form.Control
              type="text"
              placeholder={`Search by ${filterLabels[filterBy]}...`}
              value={searchTerm}
              onChange={handleSearchChange}
            />

            {searchTerm && (
              <Button variant="outline-secondary" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </InputGroup>
        </div>
      </div>

      {/* Add Student Button */}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" onClick={goToAddStudentPage}>
          Add Student +
        </Button>
      </div>

      {/* Total Students */}
      <div className="text-muted mb-2">Total Students: {totalRecords}</div>

      {/* Student Table */}
      <div className="table-responsive">
        <table className="table text-center table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Roll No</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading students...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td>
                    <img
                      src={student.image || "/profile.png"}
                      width="50"
                      height="50"
                      alt="Student"
                      className="d-block mx-auto rounded-circle"
                      style={{ objectFit: "cover" }}
                    />
                  </td>

                  <td>
                    {student.firstName} {student.lastName}
                  </td>

                  <td>{student.rollNumber}</td>

                  <td>{student.year}</td>

                  <td>
                    <Button
                      variant="outline-warning"
                      title="View Student"
                      onClick={() => goToView(student._id)}
                    >
                      <FaEye />
                    </Button>

                    <Button
                      variant="outline-primary"
                      title="Edit Student"
                      className="ms-2"
                      onClick={() => goToEdit(student._id)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      title="Delete Student"
                      className="ms-2"
                      onClick={() => goToDelete(student._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Success Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>

        <Modal.Body>Student has been deleted successfully 👍</Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default StudentList;

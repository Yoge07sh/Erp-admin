import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { Modal, Button, Form, InputGroup, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Pagination from "../../components/Pagination";

const apiUrl = import.meta.env.VITE_API_URL;

function CourseList() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [show, setShow] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const [searchByCourseName, setSearchByCourseName] = useState("");
  const [filterBy, setFilterBy] = useState("courseFullName");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const limit = 5;
  const token = localStorage.getItem("token");

  // Fetch courses whenever the filter, search, page, or deletion state changes
  useEffect(() => {
    axios({
      url: apiUrl + "/courses",
      method: "get",
      params: {
        [filterBy]: searchByCourseName,
        page: currentPage,
        limit: limit,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        if (result.data.success) {
          setCourses(result.data.data);
          setTotalPages(result.data.pagination.totalPages);
          setTotalRecords(result.data.pagination.totalRecords);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [filterBy, searchByCourseName, currentPage, isDelete]);

  // Close success modal and refresh the course list
  const handleClose = () => {
    setShow(false);
    setIsDelete((prev) => !prev);
  };

  // Navigate to Add Course page
  function goToAddCoursePage() {
    navigate("/add/course");
  }

  // Delete a course
  function goToDelete(id) {
    axios({
      url: apiUrl + "/delete/course/" + id,
      method: "delete",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        if (result.data.success) {
          setShow(true);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  // Navigate to Edit Course page
  function goToEdit(id) {
    navigate("/edit/course/" + id);
  }

  return (
    <Container>
      <h3 className="text-center mb-4 py-2 text-danger fw-bold">
        LIST OF COURSES
      </h3>

      {/* Filter and Search */}
      <InputGroup className="mb-3">
        <Form.Select
          style={{ maxWidth: "220px" }}
          value={filterBy}
          onChange={(e) => {
            setFilterBy(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="courseFullName">Course Name</option>
          <option value="courseCode">Course Code</option>
          <option value="courseShortName">Course Short Name</option>
        </Form.Select>

        <InputGroup.Text>
          <i className="bi bi-search"></i>
        </InputGroup.Text>

        <Form.Control
          type="text"
          placeholder={`Search by ${
            filterBy === "courseFullName"
              ? "Course Name"
              : filterBy === "courseCode"
                ? "Course Code"
                : "Course Short Name"
          }`}
          value={searchByCourseName}
          onChange={(e) => {
            setSearchByCourseName(e.target.value);
            setCurrentPage(1);
          }}
        />
      </InputGroup>

      {/* Add Course Button */}
      <button
        className="btn btn-success ms-3 mt-2 float-end"
        onClick={goToAddCoursePage}
      >
        Add Course +
      </button>

      {/* Course Table */}
      <div className="table-responsive">
        <table className="table text-center table-hover mt-5">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Course Short Name</th>
              <th>Intake</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseFullName}</td>
                  <td>{course.courseShortName}</td>
                  <td>{course.totalIntake}</td>

                  <td>
                    <Button
                      variant="outline-primary"
                      title="Edit Course"
                      onClick={() => goToEdit(course._id)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      title="Delete Course"
                      className="ms-2"
                      onClick={() => goToDelete(course._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Total Records */}
      <div className="text-muted mb-2">Total Records: {totalRecords}</div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete Success Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>

        <Modal.Body>Course has been deleted successfully 👍</Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CourseList;

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { Modal, Button, Form, InputGroup, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Pagination from "../../components/Pagination";

const apiUrl = import.meta.env.VITE_API_URL;

function SubjectList() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [show, setShow] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const [searchBySubjectName, setSearchBySubjectName] = useState("");
  const [filterBy, setFilterBy] = useState("subjectFullName");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const limit = 5;
  const token = localStorage.getItem("token");

  // Fetch subjects whenever the filter, search, page, or delete state changes
  useEffect(() => {
    axios({
      url: apiUrl + "/subjects",
      method: "get",
      params: {
        [filterBy]: searchBySubjectName,
        pageNo: currentPage,
        limit: limit,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        if (result.data.success) {
          setSubjects(result.data.data);
          setTotalPages(result.data.pagination.totalPages);
          setTotalRecords(result.data.pagination.totalRecords);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [filterBy, searchBySubjectName, currentPage, isDelete]);

  // Close success modal
  const handleClose = () => {
    setShow(false);
  };

  // Navigate to Edit Subject page
  function goToEdit(id) {
    navigate("/edit/subject/" + id);
  }

  // Navigate to Add Subject page
  function goToAddSubjectPage() {
    navigate("/add/subject");
  }

  // Delete subject
  function goToDelete(id) {
    axios({
      url: apiUrl + "/delete/subject/" + id,
      method: "delete",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        if (result.data.success) {
          setIsDelete((prev) => !prev);
          setShow(true);
        }
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  // Get placeholder based on selected filter
  const getSearchPlaceholder = () => {
    const placeholders = {
      subjectFullName: "Subject Name",
      subjectCode: "Subject Code",
      subjectNickName: "Subject Short Name",
      subjectCategory: "Subject Category",
      subjectType: "Subject Type",
    };

    return `Search by ${placeholders[filterBy]}`;
  };

  return (
    <Container>
      <h3 className="text-center mb-4 py-2 text-danger fw-bold">
        LIST OF SUBJECTS
      </h3>

      {/* Filter and Search */}
      <InputGroup className="mb-3">
        <Form.Select
          style={{ maxWidth: "230px" }}
          value={filterBy}
          onChange={(e) => {
            setFilterBy(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="subjectFullName">Subject Name</option>
          <option value="subjectCode">Subject Code</option>
          <option value="subjectNickName">Subject Short Name</option>
          <option value="subjectCategory">Subject Category</option>
          <option value="subjectType">Subject Type</option>
        </Form.Select>

        <InputGroup.Text>
          <i className="bi bi-search"></i>
        </InputGroup.Text>

        <Form.Control
          type="text"
          placeholder={getSearchPlaceholder()}
          value={searchBySubjectName}
          onChange={(e) => {
            setSearchBySubjectName(e.target.value);
            setCurrentPage(1);
          }}
        />
      </InputGroup>

      {/* Add Subject Button */}
      <button
        className="btn btn-success ms-3 mt-2 float-end"
        onClick={goToAddSubjectPage}
      >
        Add Subject +
      </button>

      {/* Subject Table */}
      <div className="table-responsive">
        <table className="table text-center table-hover mt-5">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Short Name</th>
              <th>Subject Category</th>
              <th>Subject Type</th>
              <th>Credit Score</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <tr key={subject._id}>
                  <td>{subject.subjectCode}</td>
                  <td>{subject.subjectNickName}</td>
                  <td>{subject.subjectCategory}</td>
                  <td>{subject.subjectType}</td>
                  <td>{subject.creditScore}</td>

                  <td>
                    <Button
                      variant="outline-primary"
                      title="Edit Subject"
                      onClick={() => goToEdit(subject._id)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      title="Delete Subject"
                      className="ms-2"
                      onClick={() => goToDelete(subject._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No subjects found.
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

        <Modal.Body>Subject has been deleted successfully 👍</Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default SubjectList;

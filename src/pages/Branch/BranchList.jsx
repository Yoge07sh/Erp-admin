import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { Modal, Button, Form, InputGroup, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Pagination from "../../components/Pagination";

const apiUrl = import.meta.env.VITE_API_URL;

function BranchList() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [show, setShow] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const [searchByBranchName, setSearchByBranchName] = useState("");
  const [filterBy, setFilterBy] = useState("branchFullName");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const limit = 5;
  const token = localStorage.getItem("token");

  // Fetch branches when search, filter, page, or deletion state changes
  useEffect(() => {
    axios({
      url: apiUrl + "/branches",
      method: "get",
      params: {
        [filterBy]: searchByBranchName,
        pageNo: currentPage,
        limit: limit,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        if (result.data.success) {
          setBranches(result.data.data);
          setTotalPages(result.data.pagination.totalPages);
          setTotalRecords(result.data.pagination.totalRecords);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [filterBy, searchByBranchName, currentPage, isDelete]);

  // Close modal and refresh the list
  const handleClose = () => {
    setShow(false);
    setIsDelete((prev) => !prev);
  };

  // Navigate to Add Branch page
  function goToAddBranchPage() {
    navigate("/add/branch");
  }

  // Delete branch
  function goToDelete(id) {
    axios({
      url: apiUrl + "/delete/branch/" + id,
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

  // Navigate to Edit Branch page
  function goToEdit(id) {
    navigate("/edit/branch/" + id);
  }

  return (
    <Container>
      <h3 className="text-center mb-4 py-2 text-danger fw-bold">
        LIST OF BRANCHES
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
          <option value="branchFullName">Branch Name</option>
          <option value="branchCode">Branch Code</option>
          <option value="branchShortName">Branch Short Name</option>
        </Form.Select>

        <InputGroup.Text>
          <i className="bi bi-search"></i>
        </InputGroup.Text>

        <Form.Control
          type="text"
          placeholder={`Search by ${
            filterBy === "branchFullName"
              ? "Branch Name"
              : filterBy === "branchCode"
                ? "Branch Code"
                : "Branch Short Name"
          }`}
          value={searchByBranchName}
          onChange={(e) => {
            setSearchByBranchName(e.target.value);
            setCurrentPage(1);
          }}
        />
      </InputGroup>

      {/* Add Branch Button */}
      <button
        className="btn btn-success ms-3 mt-2 float-end"
        onClick={goToAddBranchPage}
      >
        Add Branch +
      </button>

      {/* Branch Table */}
      <div className="table-responsive">
        <table className="table text-center table-hover mt-5">
          <thead>
            <tr>
              <th>Branch Code</th>
              <th>Branch Name</th>
              <th>Branch Short Name</th>
              <th>Intake</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {branches.length > 0 ? (
              branches.map((branch) => (
                <tr key={branch._id}>
                  <td>{branch.branchCode}</td>
                  <td>{branch.branchFullName}</td>
                  <td>{branch.branchShortName}</td>
                  <td>{branch.branchIntake}</td>

                  <td>
                    <Button
                      variant="outline-primary"
                      title="Edit Branch"
                      onClick={() => goToEdit(branch._id)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      title="Delete Branch"
                      className="ms-2"
                      onClick={() => goToDelete(branch._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No branches found.
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

        <Modal.Body>Branch has been deleted successfully 👍</Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default BranchList;

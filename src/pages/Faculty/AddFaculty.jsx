import { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import React from "react";
import { Container, Row, Col, Button, Modal, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;
function AddFaculty() {
  let navigate = useNavigate();

  const [show, setShow] = useState(false);
  // const [showModal, setShowModal] = useState(false);
  let [showSpinner, setShowSpinner] = useState(false);
  let [buttonDisabled, setButtonDisabled] = useState(false);
  let [showForm, SetShowForm] = useState(true);

  let [collegeId, setCollegeId] = useState("");
  let [thumbId, setThumbId] = useState("");
  let [firstName, setFirstName] = useState("");
  let [lastName, setLastName] = useState("");
  let [collegeEmail, setCollegeEmail] = useState("");
  let [personalEmail, setPersonalEmail] = useState("");
  let [mobileNo, setMobileNo] = useState(0);
  let [emergencyMobileNo, setEmergencyMobileNo] = useState(0);
  let [fatherName, setFatherName] = useState("");
  let [motherName, setMotherName] = useState("");
  let [gender, setGender] = useState("male");
  let [dob, setDob] = useState("");
  let [highestQualification, setHighestQualification] = useState("");
  let [designation, setDesignation] = useState("");
  let [marriedStatus, setMarriedStatus] = useState("not married");
  let [totalExperience, setTotalExperience] = useState(0);
  let [teachingExperience, setTeachingExperience] = useState(0);
  let [industryExperience, setIndustryExperience] = useState(0);
  let [researchExperience, setResearchExperience] = useState(0);
  let [file, setFile] = useState("");

  let doAddFaculty = () => {
    setButtonDisabled(true);
    SetShowForm(false);
    setShowSpinner(true);
    let formData = new FormData();
    formData.append("collegeId", collegeId);
    formData.append("thumbId", thumbId);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("collegeEmail", collegeEmail);
    formData.append("personalEmail", personalEmail);
    formData.append("mobileNo", mobileNo);
    formData.append("emergencyMobileNo", emergencyMobileNo);
    formData.append("fatherName", fatherName);
    formData.append("motherName", motherName);
    formData.append("gender", gender);
    formData.append("dob", dob);
    formData.append("highestQualification", highestQualification);
    formData.append("designation", designation);
    formData.append("marriedStatus", marriedStatus);
    formData.append("totalExperience", totalExperience);
    formData.append("teachingExperience", teachingExperience);
    formData.append("industryExperience", industryExperience);
    formData.append("researchExperience", researchExperience);
    formData.append("file", file);
    formData.append("fileName", file.name);
    axios({
      url: apiUrl + "/add/faculty",
      method: "post",
      data: formData,
      headers: {
        "content-type": "multipart/form-data",
      },
    })
      .then((result) => {
        if (result.data.success) setButtonDisabled(false);
        setShow(true);
        setShowSpinner(false);
        SetShowForm(true);
      })
      .catch((err) => {
        setShowSpinner(false);
        setButtonDisabled(false);
        SetShowForm(true);
        alert(err);
      });
  };

  const handleClose = () => {
    setShow(false);
    navigate("/faculties");
  };

  return (
    <>
      <h3 className="text-center mb-4 py-2 text-primary fw-bold ">
        ADD FACULTY
      </h3>
      <hr />

      {showForm && (
        <Container fluid>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              doAddFaculty();
            }}
          >
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>First Name :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter Faculty First Name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter Faculty Last Name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Personal Email :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    placeholder="Enter Personal email"
                  />
                </Form.Group>
              </Col>

              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>College Id :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setCollegeId(e.target.value)}
                    placeholder="Enter College Id"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile No :-</Form.Label>
                  <Form.Control
                    type="number"
                    onChange={(e) => setMobileNo(e.target.value)}
                    placeholder="Enter Mobile"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Mobile No :-</Form.Label>
                  <Form.Control
                    type="number"
                    onChange={(e) => setEmergencyMobileNo(e.target.value)}
                    placeholder="Enter Emergency Mobile"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Mother's Name :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="Enter Faculty mother's Name"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Father's Name :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Enter Faculty Father's Name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Label>Gender :-</Form.Label>
                <Form.Select
                  aria-label="Gender"
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
              </Col>
              <Col>
                <Form.Label>Married Status :-</Form.Label>
                <Form.Select
                  aria-label="marriedstatus"
                  onChange={(e) => setMarriedStatus(e.target.value)}
                >
                  <option value="not married">Not Married</option>
                  <option value="married">Married</option>
                </Form.Select>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Date Of Birth :-</Form.Label>
                  <Form.Control
                    type="date"
                    onChange={(e) => setDob(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Thumb Id :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setThumbId(e.target.value)}
                    placeholder="Enter Thumb Id"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>College Email :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    placeholder="Enter College email"
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Designation :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Enter Designation"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Highest Qualification :-</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setHighestQualification(e.target.value)}
                    placeholder="Upload Highest Qualification"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Total Experience :-</Form.Label>
                  <Form.Control
                    type="number"
                    onChange={(e) => setTotalExperience(e.target.value)}
                    placeholder="Enter Total Experience"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Teaching Experience :-</Form.Label>
                  <Form.Control
                    type="number"
                    onChange={(e) => setTeachingExperience(e.target.value)}
                    placeholder="Enter Teaching Experience"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Industry Experience :-</Form.Label>
                  <Form.Control
                    type="number"
                    onChange={(e) => setIndustryExperience(e.target.value)}
                    placeholder="Enter Industry Experience"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Research Experience :-</Form.Label>
                  <Form.Control
                    type="number"
                    onChange={(e) => setResearchExperience(e.target.value)}
                    placeholder="Enter Research Experience"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Upload Faculty Image :-</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    placeholder="Upload Faculty Image"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button
                className="me-2"
                variant="danger"
                onClick={() => navigate("/faculties")}
              >
                Cancel
              </Button>
              <Button variant="success" type="submit" disabled={buttonDisabled}>
                Add Faculty
              </Button>
            </div>
            <span className="mx-4 text-secondary ">Or upload via csv</span>
            {/* <Button
                variant="success"
                disabled={buttonDisabled}
                onClick={doUploadCsv}
              >
                upload Csv
              </Button> */}
          </Form>
        </Container>
      )}
      {showSpinner && (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>Faculty Added Successfully</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>
  <input
    type="file"
    name="facultyData"
    accept=".csv"
    onChange={(e) => {
      if (e.target.files.length > 0) {
        setFile(e.target.files[0]);
      }
    }}
  />
  <Button variant="success" disabled={buttonDisabled} onClick={doAddFaculties}>
    Upload CSV
  </Button>
</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal> */}
    </>
  );
}

export default AddFaculty;

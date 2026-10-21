import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import AdminLayout from "./components/AdminLayout";

import WelcomePage from "./pages/WelcomePage/WelcomePage";

// Branch
import AddBranch from "./pages/Branch/AddBranch";
import BranchList from "./pages/Branch/BranchList";
import BranchEdit from "./pages/Branch/BranchEdit";

// Course
import AddCourse from "./pages/Course/AddCourse";
import CourseList from "./pages/Course/CourseList";
import CourseEdit from "./pages/Course/CourseEdit";

// Subject
import AddSubject from "./pages/Subject/AddSubject";
import SubjectList from "./pages/Subject/SubjectList";
import SubjectEdit from "./pages/Subject/SubjectEdit";

// Subject Mapping
import AddSubjectMapping from "./pages/SubjectMapping/AddSubjectMapping";
import SubjectMappingList from "./pages/SubjectMapping/SubjectMappingList";
import EditSubjectMapping from "./pages/SubjectMapping/EditSubjectMapping";

// Faculty
import AddFaculty from "./pages/Faculty/AddFaculty";
import FacultyList from "./pages/Faculty/FacultyList";
import FacultyEdit from "./pages/Faculty/FacultyEdit";
import FacultyProfile from "./pages/Faculty/FacultyProfile";

// Login
import AdminLogin from "./pages/LoginSignupPages/AdminLogin";

// Faculty Mapping
import FacultyMappingList from "./pages/FacultyMapping/FacultyMappingList";
import AddFacultyMapping from "./pages/FacultyMapping/AddFacultyMapping";
import EditFacultyMapping from "./pages/FacultyMapping/EditFacultyMapping";

// Student
import AddStudent from "./pages/Student/AddStudent";
import StudentList from "./pages/Student/StudentList";
import StudentEdit from "./pages/Student/StudentEdit";
import StudentProfile from "./pages/Student/StudentProfile";

// TimeSlots
import TimeSlotList from "./pages/TimeSlots/TimeSlotsList";
import AddTimeSlot from "./pages/TimeSlots/AddTimeSlot";
import EditTimeSlot from "./pages/TimeSlots/EditTimeSot";

// Attendance
import GetStudentForm from "./pages/Attendance/GetStudentForm";
import StudentsAttendance from "./pages/Attendance/StudentsAttendance";
import ViewAttendance from "./pages/Attendance/ViewAttendance";
import EditAttendance from "./pages/Attendance/EditAttendance";
import AttendanceRegister from "./pages/Attendance/AttendanceRegister";
import Eregister from "./pages/Attendance/Eregister";
import AttendanceSummary from "./pages/Attendance/AttendanceSummary";
import MyAttendance from "./pages/Attendance/MyAttendance";
import AttendanceRegisterView from "./pages/Attendance/AttendanceRegisterView";
import AttendanceRegisterForm from "./pages/Attendance/AttendanceREgisterform";
import TotalAttendanceRegister from "./pages/Attendance/TotalAttendanceRegister";
import TotalAttendanceForm from "./pages/Attendance/TotalAttendanceForm";

function AppContent() {
  const location = useLocation();

  // Login page should NOT use AdminLayout
  if (location.pathname === "/") {
    return (
      <Routes>
        <Route path="/" element={<AdminLogin />} />
      </Routes>
    );
  }

  // All other pages use AdminLayout
  return (
    <AdminLayout>
      <Routes>
        {/* Dashboard */}
        <Route path="/admin/dashboard" element={<WelcomePage />} />

        {/* Welcome */}
        <Route path="/welcome" element={<WelcomePage />} />

        {/* Courses */}
        <Route path="/courses" element={<CourseList />} />

        <Route path="/add/course" element={<AddCourse />} />

        <Route path="/edit/course/:id" element={<CourseEdit />} />

        {/* Branches */}
        <Route path="/branches" element={<BranchList />} />

        <Route path="/add/branch" element={<AddBranch />} />

        <Route path="/edit/branch/:id" element={<BranchEdit />} />

        {/* Subjects */}
        <Route path="/subjects" element={<SubjectList />} />

        <Route path="/add/subject" element={<AddSubject />} />

        <Route path="/edit/subject/:id" element={<SubjectEdit />} />

        {/* Subject Mapping */}
        <Route path="/subjectsmap" element={<SubjectMappingList />} />

        <Route path="/add/subjectmapping" element={<AddSubjectMapping />} />

        <Route
          path="/edit/subjectMapping/:id"
          element={<EditSubjectMapping />}
        />

        {/* Faculty */}
        <Route path="/faculties" element={<FacultyList />} />

        <Route path="/add/faculty" element={<AddFaculty />} />

        <Route path="/edit/faculty/:id" element={<FacultyEdit />} />

        <Route path="/faculty/profile/:id" element={<FacultyProfile />} />

        {/* Faculty Mapping */}
        <Route path="/facultymapping" element={<FacultyMappingList />} />

        <Route path="/add/facultymapping" element={<AddFacultyMapping />} />

        <Route
          path="/edit/facultymapping/:id"
          element={<EditFacultyMapping />}
        />

        {/* Students */}
        <Route path="/students" element={<StudentList />} />

        <Route path="/add/student" element={<AddStudent />} />

        <Route path="/edit/student/:id" element={<StudentEdit />} />

        <Route path="/student/profile/:id" element={<StudentProfile />} />

        {/* TimeSlots */}
        <Route path="/timeslots" element={<TimeSlotList />} />

        <Route path="/add/timeslots" element={<AddTimeSlot />} />

        <Route path="/edit/timeslot/:id" element={<EditTimeSlot />} />

        {/* Attendance */}
        <Route path="/getstudents" element={<GetStudentForm />} />

        <Route path="/studentsattendance" element={<StudentsAttendance />} />

        <Route path="/viewattendance" element={<ViewAttendance />} />

        <Route
          path="/edit/attendance/:facultyMapId/:SingletimeSlot/:selectedDate"
          element={<EditAttendance />}
        />

        <Route path="/register" element={<AttendanceRegister />} />

        <Route path="/eregister" element={<Eregister />} />
        <Route
          path="/attendancesummary"
          element={<AttendanceSummary />}
        ></Route>
        <Route path="/student/attendance" element={<MyAttendance />} />
        <Route
          path="/attendance-register"
          element={<AttendanceRegisterForm />}
        />

        <Route
          path="/attendance-register/view"
          element={<AttendanceRegisterView />}
        />
        <Route
          path="/total-attendance-report"
          element={<TotalAttendanceRegister />}
        />
        <Route
          path="/total-attendance"
          element={<TotalAttendanceForm />}
        ></Route>
      </Routes>
    </AdminLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

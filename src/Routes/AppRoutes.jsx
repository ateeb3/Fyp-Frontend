import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import JoinSession from "../pages/Classroom/JoinSession";
import ChangePassword from "../pages/Auth/ChangePassword";
import PrivateRoute from "../PrivateRoute";

// --- LAYOUTS ---
import AdminLayout from "../Layouts/AdminLayout";
import InstructorLayout from "../Layouts/InstructorLayout";
import CoordinatorLayout from "../Layouts/CoordinatorLayout";
import StudentLayout from "../Layouts/StudentLayout";

// --- ADMIN IMPORTS ---
import AdminDashboard from "../pages/Admin/AdminDashboard";
import CreateDepartment from "../pages/Admin/CreateDepartment";
import RegisterCoordinator from "../pages/Admin/RegisterCoordinator";
import ViewDepartments from "../pages/Admin/ViewDepartments";
import AddCoordinator from "../pages/Admin/AddCoordinator";
import ViewCoordinators from "../pages/Admin/ViewCoordinators";

// --- COORDINATOR IMPORTS ---
import CoordinatorDashboard from "../pages/Coordinator/CoordinatorDashboard";
import RegisterInstructor from "../pages/Coordinator/RegisterInstructor";
import AddInstructor from "../pages/Coordinator/AddInstructor";
import ViewInstructors from "../pages/Coordinator/ViewInstructors";
import RegisterStudent from "../pages/Coordinator/RegisterStudent";
import AddStudent from "../pages/Coordinator/AddStudent";
import ViewStudents from "../pages/Coordinator/ViewStudents";
import AddCourse from "../pages/Coordinator/AddCourse";
import ViewCourses from "../pages/Coordinator/ViewCourses";
import CoursesAssigned from "../pages/Coordinator/CoursesAssigned";
import ViewAssignedCourses from "../pages/Coordinator/ViewAssignedCourses";
import EnrollStudents from "../pages/Coordinator/EnrollStudents";
import ViewEnrolledStudents from "../pages/Coordinator/ViewEnrolledStudents";
import PromoteStudents from "../pages/Coordinator/PromoteStudents";

// --- INSTRUCTOR IMPORTS ---
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import TeacherCourses from "../pages/instructor/TeacherCourses";
import StudentList from "../pages/instructor/StudentsList";
import AssignTask from "../pages/instructor/AssignTask"; 
import InstructorGrading from "../pages/instructor/InstructorGrading"; 
import InstructorSessionReport from "../pages/instructor/InstructorSessionReport"; 
import InstructorReportsHub from "../pages/instructor/InstructorReportsHub"; 

// --- STUDENT IMPORTS ---
import StudentDashboard from "../pages/Student/StudentDashboard";
import MyCourses from "../pages/Student/MyCourses";
import MyTeachers from "../pages/Student/MyTeachers";
import StudentTaskList from "../pages/Student/StudentTaskList"; 
import StudentSubmittedTasks from "../pages/Student/StudentSubmittedTasks";
import StudentSessionReport from "../pages/Student/StudentSessionReport"; 
import StudentReportsHub from "../pages/Student/StudentReportsHub";

// --- CLASSROOM ---
import Classroom from "../pages/Classroom/Classroom";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* PROTECTED ROUTES */}
        <Route element={<PrivateRoute />}>
          
          {/* 🔥 SHARED FULL-SCREEN ROUTE (Outside Layouts to hide Sidebar) */}
          <Route path="/classroom" element={<Classroom />} />
          <Route path="/join/:sessionId" element={<JoinSession />} />

          {/* ADMIN */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create-department" element={<CreateDepartment />} />
            <Route path="/admin/view-departments" element={<ViewDepartments />} />
            <Route path="/admin/add-coordinator" element={<AddCoordinator />} />
            <Route path="/admin/register-coordinator" element={<RegisterCoordinator />} />
            <Route path="/admin/view-coordinator" element={<ViewCoordinators />} />
            <Route path="/admin/change-password" element={<ChangePassword />} />
          </Route>

          {/* COORDINATOR */}
          <Route element={<CoordinatorLayout />}>
            <Route path="/coordinator-dashboard" element={<CoordinatorDashboard />} />
            <Route path="/coordinator/register-instructor" element={<RegisterInstructor />} />
            <Route path="/coordinator/add-instructor" element={<AddInstructor />} />
            <Route path="/coordinator/view-instructors" element={<ViewInstructors />} />
            <Route path="/coordinator/register-student" element={<RegisterStudent />} />
            <Route path="/coordinator/add-student" element={<AddStudent />} />
            <Route path="/coordinator/view-students" element={<ViewStudents />} />
            <Route path="/coordinator/add-course" element={<AddCourse />} />
            <Route path="/coordinator/view-courses" element={<ViewCourses />} />
            <Route path="/coordinator/courses-assigned" element={<CoursesAssigned />} />
            <Route path="/coordinator/view-assigned-courses" element={<ViewAssignedCourses />} />
            <Route path="/coordinator/enroll-students" element={<EnrollStudents />} />
            <Route path="/coordinator/view-enroll-students" element={<ViewEnrolledStudents />} />
            <Route path="/coordinator/change-password" element={<ChangePassword />} />
            <Route path="/coordinator/promote-students" element={<PromoteStudents />} />
          </Route>

          {/* INSTRUCTOR */}
          <Route element={<InstructorLayout />}>
            <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/teacher-courses" element={<TeacherCourses />} />
            <Route path="/instructor/change-password" element={<ChangePassword />} />
            <Route path="/instructor/students" element={<StudentList />} />
            <Route path="/instructor/assign-task" element={<AssignTask />} /> 
            <Route path="/instructor/grading" element={<InstructorGrading />} />
            
            {/* Reports */}
            <Route path="/instructor/reports" element={<InstructorReportsHub />} />
            <Route path="/instructor/reports/:sessionId" element={<InstructorSessionReport />} />
          </Route>

          {/* STUDENT */}
          <Route element={<StudentLayout />}>
            <Route path="/student-dashboard" element={<StudentDashboard/>} />
            <Route path="/student/courses" element={<MyCourses/>} />
            <Route path="/student/teachers" element={<MyTeachers/>} />
            <Route path="/student/change-password" element={<ChangePassword />} />
            <Route path="/student/tasks" element={<StudentTaskList />} />
            <Route path="/student/submitted-tasks" element={<StudentSubmittedTasks />} />
            <Route path="/student/reports" element={<StudentReportsHub />} />
            <Route path="/student/reports/:sessionId" element={<StudentSessionReport />} />
          </Route>

        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
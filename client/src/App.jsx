// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import VerifyEmail from "./pages/VerifyEmail";

// import Dashboard from "./pages/Dashboard";
// import OwnerDashboard from "./pages/owner/OwnerDashboard";
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import Properties from "./pages/Properties";
// import PropertyDetails from "./pages/PropertyDetails";
// import Favorites from "./pages/Favorites";
// import Applications from "./pages/Applications";
// import Bookings from "./pages/Bookings";
// import Notifications from "./pages/Notifications";
// import OwnerApplications from "./pages/owner/Applications";
// import OwnerBookings from "./pages/owner/Bookings";
// import CreateProperty from "./pages/owner/CreateProperty";
// import EditProperty from "./pages/owner/EditProperty";
// import AdminUsers from "./pages/admin/Users";
// import AdminProperties from "./pages/admin/Properties";
// import AdminApplications from "./pages/admin/Applications";
// import AdminBookings from "./pages/admin/Bookings";
// import CreateApplication from "./pages/CreateApplication";
// import CreateBooking from "./pages/CreateBooking";
// function Home() {
//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-blue-600">RentEase</h1>

//         <p className="mt-3 text-gray-600">Find your perfect rental home</p>
//       </div>
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Home */}
//         <Route path="/" element={<Home />} />

//         {/* Authentication */}
//         <Route path="/login" element={<Login />} />

//         <Route path="/register" element={<Register />} />

//         <Route path="/verify-email" element={<VerifyEmail />} />
//         <Route path="/properties" element={<Properties />} />
//         <Route path="/properties/:id" element={<PropertyDetails />} />
//         <Route path="/favorites" element={<Favorites />} />
//         <Route path="/applications" element={<Applications />} />
//         <Route path="/bookings" element={<Bookings />} />
//         <Route path="/notifications" element={<Notifications />} />
//         <Route path="/applications/create" element={<CreateApplication />} />
//         <Route path="/bookings/create" element={<CreateBooking />} />

//         {/* Tenant Dashboard */}
//         <Route path="/dashboard" element={<Dashboard />} />

//         {/* Owner Dashboard */}
//         <Route path="/owner/dashboard" element={<OwnerDashboard />} />
//         <Route path="/owner/applications" element={<OwnerApplications />} />
//         <Route path="/owner/bookings" element={<OwnerBookings />} />
//         <Route path="/owner/properties/create" element={<CreateProperty />} />
//         <Route path="/owner/properties/edit/:id" element={<EditProperty />} />
//         {/* Admin Dashboard */}
//         <Route path="/admin/dashboard" element={<AdminDashboard />} />
//         <Route path="/admin/users" element={<AdminUsers />} />
//         <Route path="/admin/properties" element={<AdminProperties />} />
//         {/* <Route path="/admin/applications" element={<AdminApplications />} /> */}
//         <Route path="/admin/applications" element={<AdminApplications />} />
//         <Route path="/admin/bookings" element={<AdminBookings />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

import Dashboard from "./pages/Dashboard";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerApplications from "./pages/owner/Applications";
import OwnerBookings from "./pages/owner/Bookings";
import CreateProperty from "./pages/owner/CreateProperty";
import MyProperties from "./pages/owner/MyProperties";
import EditProperty from "./pages/owner/EditProperty";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminProperties from "./pages/admin/Properties";
import AdminApplications from "./pages/admin/Applications";
import AdminBookings from "./pages/admin/Bookings";

import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";

import Favorites from "./pages/Favorites";
import Applications from "./pages/Applications";
import Bookings from "./pages/Bookings";
import Notifications from "./pages/Notifications";

import CreateApplication from "./pages/CreateApplication";
import CreateBooking from "./pages/CreateBooking";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OwnerContracts from "./pages/owner/Contracts";
import CreateContract from "./pages/owner/CreateContract";
import MyContracts from "./pages/MyContracts";
import ContractDetails from "./pages/ContractDetails";
import Payments from "./pages/Payments";
import OwnerPayments from "./pages/owner/OwnerPayments";
import CreatePayment from "./pages/owner/CreatePayment";
import Maintenance from "./pages/Maintenance";
import Complaints from "./pages/Complaints";
import OwnerComplaints from "./pages/owner/OwnerComplaints";
import MyApplications from "./pages/MyApplications";
import OwnerProfile from "./pages/owner/OwnerProfile";
import EditProfile from "./pages/owner/EditProfile";
import OwnerMaintenance from "./pages/owner/OwnerMaintenance";
import AdminReports from "./pages/admin/AdminReports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/register" element={<Register />} />

        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Public Properties */}
        <Route path="/properties" element={<Properties />} />

        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/contracts" element={<MyContracts />} />

        <Route path="/contracts/:contractId" element={<ContractDetails />} />

        {/* Tenant */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/favorites" element={<Favorites />} />

        <Route path="/applications" element={<Applications />} />

        <Route path="/applications/create" element={<CreateApplication />} />

        <Route path="/bookings" element={<Bookings />} />

        <Route path="/bookings/create" element={<CreateBooking />} />

        <Route path="/notifications" element={<Notifications />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/my-applications" element={<MyApplications />} />

        {/* Owner */}
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />

        <Route path="/owner/applications" element={<OwnerApplications />} />

        <Route path="/owner/bookings" element={<OwnerBookings />} />

        <Route path="/owner/properties/create" element={<CreateProperty />} />
        <Route path="/owner/properties" element={<MyProperties />} />

        <Route path="/owner/properties/edit/:id" element={<EditProperty />} />
        <Route path="/owner/contracts" element={<OwnerContracts />} />
        <Route path="/owner/contracts/create" element={<CreateContract />} />
        <Route path="/owner/payments" element={<OwnerPayments />} />
        <Route path="/owner/payments/create" element={<CreatePayment />} />
        <Route path="/owner/complaints" element={<OwnerComplaints />} />

        <Route path="/owner/profile" element={<OwnerProfile />} />

        <Route path="/owner/profile/edit" element={<EditProfile />} />
        <Route path="/owner/maintenance" element={<OwnerMaintenance />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/users" element={<AdminUsers />} />

        <Route path="/admin/properties" element={<AdminProperties />} />

        <Route path="/admin/applications" element={<AdminApplications />} />

        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

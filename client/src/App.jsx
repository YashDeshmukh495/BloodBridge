import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateBloodRequest from "./pages/CreateBloodRequest";
import SubmitDonorResponse from "./pages/SubmitDonorResponse";
import DonorResponses from "./pages/DonorResponses";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import MyRequests from "./pages/MyRequests";
import AvailableRequests from "./pages/AvailableRequests";
import DonorEligibility from "./pages/DonorEligibility";
import MyDonorResponses from "./pages/MyDonorResponses";
import FindDonors from "./pages/FindDonors";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
  path="/"
  element={<Home />}
/>
        {/* Login - temporary */}
        <Route
            path="/login"
               element={<Login />}
           />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />
{/*Blood request*/}
        <Route
  path="/blood-request"
  element={<CreateBloodRequest />}
/>
{/*Doner request*/}
<Route
  path="/blood-request/:id/respond"
  element={<SubmitDonorResponse />}
/>

<Route
  path="/blood-request/:id/responses"
  element={<DonorResponses />}
/>

        {/* Dashboard - temporary */}
        <Route
  path="/dashboard"
  element={<Dashboard />}
/>
<Route path="/profile" element={<Profile />} />

<Route
  path="/my-requests"
  element={<MyRequests />}
/>

<Route
  path="/blood-requests"
  element={<AvailableRequests />}
/>
<Route
  path="/find-donors"
  element={<FindDonors />}
/>

<Route
  path="/donor-eligibility/:responseId"
  element={<DonorEligibility />}
/>
<Route
  path="/my-donor-responses"
  element={<MyDonorResponses />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
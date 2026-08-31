# Implementation Plan - BloodBridge Enhancements and Bug Fixes

This plan outlines the proposed changes to the BloodBridge application to fix the donor eligibility flow bug, hook up the "Available to Donate" toggle to the database, implement the "Find Donors" page and backend endpoint, and make the navbar sticky.

## Proposed Changes

---

### Backend Updates

#### [MODIFY] [User Model](file:///c:/Users/croma/OneDrive/Desktop/BloodBridge/server/models/User.js)
- Add the `availableToDonate` field to the schema:
  ```js
  availableToDonate: {
    type: Boolean,
    default: false
  }
  ```

#### [MODIFY] [Auth Controller](file:///c:/Users/croma/OneDrive/Desktop/BloodBridge/server/controllers/authController.js)
- Update registration, login, and location updates to return the `availableToDonate` field.
- Implement the `updateAvailability` controller function:
  ```js
  const updateAvailability = async (req, res) => {
    try {
      const { availableToDonate } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: { availableToDonate } },
        { new: true }
      ).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ message: "Availability updated", user });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };
  ```
- Implement the `getAvailableDonors` controller function to filter donors where `availableToDonate === true` (excluding the current user), matching compatibility if a blood group is queried, and matching city (primary or current) if queried.
- Implement the `getUserProfile` controller function to fetch the complete user document.

#### [MODIFY] [Auth Routes](file:///c:/Users/croma/OneDrive/Desktop/BloodBridge/server/routes/authRoutes.js)
- Mount the new endpoints:
  - `GET /profile` -> Mapped to `getUserProfile` (replacing the inline middleware return)
  - `PUT /availability` -> Mapped to `updateAvailability`
  - `GET /donors` -> Mapped to `getAvailableDonors`

---

### Frontend Updates

#### [MODIFY] [Dashboard Page](file:///c:/Users/croma/OneDrive/Desktop/BloodBridge/client/src/pages/Dashboard.jsx)
- On load (`useEffect`), call `GET /api/auth/profile` to get the latest user profile state and update state and local storage.
- Update the toggle button logic:
  - Set the state immediately.
  - Make a `PUT /api/auth/availability` request.
  - If it fails, revert the state and display an error message.

#### [MODIFY] [Dashboard CSS](file:///c:/Users/croma/OneDrive/Desktop/BloodBridge/client/src/pages/Dashboard.css)
- Change `.dashboard-navbar` position to `sticky` with `top: 0` and increase `z-index` to `1000` to keep the navbar visible on scroll.

#### [MODIFY] [SubmitDonorResponse Page](file:///c:/Users/croma/OneDrive/Desktop/BloodBridge/client/src/pages/SubmitDonorResponse.jsx)
- On load (`useEffect`), fetch G's responses using `/api/blood-requests/my-responses` to check if a response already exists for the given request ID.
- Implement the requested conditions:
  - **No response**: Show initial respond form.
  - **Pending**: Show "Your response is waiting for the request owner."
  - **Rejected**: Show "Your donation response was rejected."
  - **Accepted (Eligibility NOT complete)**: Redirect automatically to `/donor-eligibility/:responseId`.
  - **Eligibility Completed**: Show "Eligibility completed successfully."

#### [MODIFY] [DonorEligibility Page](file:///c:/Users/croma/OneDrive/Desktop/BloodBridge/client/src/pages/DonorEligibility.jsx)
- Adjust the headers to display "Complete Donor Eligibility" and "Your donation response has been accepted. Please complete the final eligibility confirmation." instead of the generic headers.

#### [NEW] [FindDonors Page](file:///c:/Users/croma/OneDrive/Desktop/BloodBridge/client/src/pages/FindDonors.jsx)
- Create a premium UI page to search and display compatible available donors.
- Allow filtering by:
  - City (defaults to user's city)
  - Required Blood Group (defaults to user's blood group)
- Fetches donors from the `GET /api/auth/donors` API endpoint.
- Respects `availableToDonate === true`.

#### [MODIFY] [App Routing](file:///c:/Users/croma/OneDrive/Desktop/BloodBridge/client/src/App.jsx)
- Register the `/find-donors` route to point to the newly created `FindDonors` component.

## Verification Plan

### Manual Verification
1. **Donor Flow**:
   - Register account F and account G (Dewas, compatible blood groups).
   - G turns on availability toggle.
   - F creates B+ request. G finds F's request and responds.
   - F accepts G.
   - G refreshes or navigates to `/blood-request/:id/respond` -> verify G is redirected to the final eligibility page.
   - G submits final eligibility -> verify F sees G's eligibility completed.
2. **Rejection Flow**:
   - Repeat response. F rejects G.
   - G opens request -> verify G sees "Your donation response was rejected."
3. **Availability Toggle**:
   - Turn availability ON. Refresh/re-login -> verify state is persisted in DB.
   - Verify Find Donors page lists G only when availability is ON.
4. **Navbar Sticky**:
   - Scroll down on Dashboard -> verify navbar remains visible at the top.

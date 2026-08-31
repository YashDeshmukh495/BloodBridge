const BASE_URL = "http://localhost:5000/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("=== STARTING BLOODBRIDGE IMPROVEMENTS INTEGRATION TESTS ===");

  try {
    // Generate unique emails/mobiles for clean runs
    const timestamp = Date.now();
    const emailF = `user_f_${timestamp}@example.com`;
    const emailG = `user_g_${timestamp}@example.com`;
    const mobileF = `912345${String(timestamp).slice(-4)}`;
    const mobileG = `954321${String(timestamp).slice(-4)}`;

    console.log(`F: ${emailF}, ${mobileF}`);
    console.log(`G: ${emailG}, ${mobileG}`);

    // ==================================================
    // 1. REGISTRATION & LOGIN
    // ==================================================
    console.log("\n1. Registering Account F (Dewas, B+)...");
    const regFRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User F",
        email: emailF,
        password: "password123",
        confirmPassword: "password123",
        mobile: mobileF,
        bloodGroup: "B+",
        dateOfBirth: "1995-05-15",
        weight: 70,
        hasDonatedBefore: false,
        city: "Dewas",
        pinCode: "455001"
      })
    });
    const regFData = await regFRes.json();
    if (!regFRes.ok) throw new Error(`Reg F failed: ${JSON.stringify(regFData)}`);
    console.log("F registered successfully.");

    console.log("Registering Account G (Dewas, O+)...");
    const regGRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User G",
        email: emailG,
        password: "password123",
        confirmPassword: "password123",
        mobile: mobileG,
        bloodGroup: "O+",
        dateOfBirth: "1998-08-20",
        weight: 65,
        hasDonatedBefore: true,
        lastDonationDate: "2025-01-01",
        city: "Dewas",
        pinCode: "455001"
      })
    });
    const regGData = await regGRes.json();
    if (!regGRes.ok) throw new Error(`Reg G failed: ${JSON.stringify(regGData)}`);
    console.log("G registered successfully.");

    console.log("Logging in F and G...");
    const loginFRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailF, password: "password123" })
    });
    const loginFData = await loginFRes.json();
    const tokenF = loginFData.token;

    const loginGRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailG, password: "password123" })
    });
    const loginGData = await loginGRes.json();
    const tokenG = loginGData.token;

    // Verify stats defaults are present and 0
    console.log("F donationsCount:", loginFData.user.donationsCount);
    console.log("F bloodReceivedCount:", loginFData.user.bloodReceivedCount);

    // ==================================================
    // 2. VALIDATION TESTING: MOBILE NUMBER & UNITS REQUIRED
    // ==================================================
    console.log("\n2. Testing Backend Validations (F tries to create invalid request)...");
    
    // Test Case 4 & 5: Invalid mobile length/letters, invalid units
    const invalidScenarios = [
      { contactNumber: "91234567891", unitsRequired: 3, desc: "Mobile with 11 digits" },
      { contactNumber: "912345678", unitsRequired: 3, desc: "Mobile with 9 digits" },
      { contactNumber: "91234abc89", unitsRequired: 3, desc: "Mobile with letters" },
      { contactNumber: "9123456789", unitsRequired: 0, desc: "Units = 0" },
      { contactNumber: "9123456789", unitsRequired: 7, desc: "Units = 7" },
      { contactNumber: "9123456789", unitsRequired: -1, desc: "Units = -1" },
      { contactNumber: "9123456789", unitsRequired: 1.5, desc: "Units = 1.5 (decimal)" }
    ];

    for (const scenario of invalidScenarios) {
      const res = await fetch(`${BASE_URL}/blood-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenF}`
        },
        body: JSON.stringify({
          patientName: "Patient F",
          bloodGroup: "B+",
          hospital: "Dewas Govt Hospital",
          unitsRequired: scenario.unitsRequired,
          urgency: "High",
          contactNumber: scenario.contactNumber,
          description: "Testing validations"
        })
      });
      const data = await res.json();
      if (res.ok) {
        throw new Error(`Validation failed for scenario: ${scenario.desc}. Backend allowed it!`);
      } else {
        console.log(`Success: Backend rejected invalid scenario: ${scenario.desc}. Message: "${data.message}"`);
      }
    }

    // ==================================================
    // 3. CREATE VALID REQUEST
    // ==================================================
    console.log("\n3. Creating valid request by F (Units=2, Contact=10 digits)...");
    const reqRes = await fetch(`${BASE_URL}/blood-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenF}`
      },
      body: JSON.stringify({
        patientName: "Patient F",
        bloodGroup: "B+",
        hospital: "Dewas Govt Hospital",
        unitsRequired: 2,
        urgency: "High",
        contactNumber: mobileF,
        description: "Valid request"
      })
    });
    const reqData = await reqRes.json();
    if (!reqRes.ok) throw new Error(`Failed to create valid request: ${JSON.stringify(reqData)}`);
    const requestId = reqData.bloodRequest._id;
    console.log("Blood Request created successfully. ID:", requestId);

    // ==================================================
    // 4. TEST DONOR VISIBILITY & RESPONSE RESTRICTION
    // ==================================================
    console.log("\n4. Testing Donor Visibility and Response availability rules...");
    // G is currently availableToDonate = false by default. G should see NO available requests
    const getReqsG1 = await fetch(`${BASE_URL}/blood-requests`, {
      headers: { Authorization: `Bearer ${tokenG}` }
    });
    const getReqsG1Data = await getReqsG1.json();
    console.log("G (availableToDonate = false) available requests count:", getReqsG1Data.availableRequests.length);
    if (getReqsG1Data.availableRequests.length !== 0) {
      throw new Error("G should see 0 available requests when unavailable to donate!");
    }

    // G tries to respond to the request (should be rejected)
    const respondG1 = await fetch(`${BASE_URL}/blood-requests/${requestId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenG}`
      },
      body: JSON.stringify({ message: "I want to help!" })
    });
    const respondG1Data = await respondG1.json();
    if (respondG1.ok) {
      throw new Error("G should not be allowed to respond to request when availableToDonate = false!");
    } else {
      console.log("Success: G was blocked from responding. Message:", respondG1Data.message);
    }

    // Now turn G availableToDonate = ON
    console.log("Toggling G availability to ON...");
    const toggleOnRes = await fetch(`${BASE_URL}/auth/availability`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenG}`
      },
      body: JSON.stringify({ availableToDonate: true })
    });
    const toggleOnData = await toggleOnRes.json();
    console.log("G availability is now:", toggleOnData.user.availableToDonate);

    // G should now see F's request
    const getReqsG2 = await fetch(`${BASE_URL}/blood-requests`, {
      headers: { Authorization: `Bearer ${tokenG}` }
    });
    const getReqsG2Data = await getReqsG2.json();
    console.log("G (availableToDonate = true) available requests count:", getReqsG2Data.availableRequests.length);
    const foundReq = getReqsG2Data.availableRequests.find(r => r._id === requestId);
    if (!foundReq) {
      throw new Error("G should see F's request when availableToDonate = true!");
    }
    console.log("Success: G can see F's request.");

    // G responds successfully now
    console.log("G submitting donor response...");
    const respondRes = await fetch(`${BASE_URL}/blood-requests/${requestId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenG}`
      },
      body: JSON.stringify({ message: "Ready to donate compatible blood!" })
    });
    const respondData = await respondRes.json();
    if (!respondRes.ok) throw new Error(`Failed G response submission: ${JSON.stringify(respondData)}`);
    const responseId = respondData.response._id;
    console.log("Response submitted. ID:", responseId);

    // ==================================================
    // 5. ENTIRE WORKFLOW & STATS INCREMENT
    // ==================================================
    console.log("\n5. Proceeding with accept, eligibility, and completion flow...");
    // F accepts G
    const acceptRes = await fetch(`${BASE_URL}/blood-requests/response/${responseId}/accept`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenF}` }
    });
    const acceptData = await acceptRes.json();
    console.log("F accepted G response. Status:", acceptData.response.status);

    // G submits eligibility
    const eligRes = await fetch(`${BASE_URL}/blood-requests/response/${responseId}/eligibility`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenG}`
      },
      body: JSON.stringify({ healthConfirmed: true })
    });
    const eligData = await eligRes.json();
    console.log("G eligibility submitted. isEligible:", eligData.isEligible);

    // Fetch initial profile stats before completion
    const profileDonorBefore = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenG}` }
    });
    const donorBeforeData = await profileDonorBefore.json();
    const donorDonationsBefore = donorBeforeData.user.donationsCount || 0;

    const profileRecBefore = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenF}` }
    });
    const recBeforeData = await profileRecBefore.json();
    const recReceivedBefore = recBeforeData.user.bloodReceivedCount || 0;

    console.log(`Stats Before completion -> Donor (G) donations: ${donorDonationsBefore}, Recipient (F) received: ${recReceivedBefore}`);

    // F completes the donation
    console.log("F completes blood donation...");
    const completeRes = await fetch(`${BASE_URL}/blood-requests/response/${responseId}/complete`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenF}` }
    });
    const completeData = await completeRes.json();
    if (!completeRes.ok) throw new Error(`Donation completion failed: ${JSON.stringify(completeData)}`);
    console.log("Donation completed successfully.");

    // Fetch profile stats after completion
    const profileDonorAfter = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenG}` }
    });
    const donorAfterData = await profileDonorAfter.json();
    const donorDonationsAfter = donorAfterData.user.donationsCount || 0;

    const profileRecAfter = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenF}` }
    });
    const recAfterData = await profileRecAfter.json();
    const recReceivedAfter = recAfterData.user.bloodReceivedCount || 0;

    console.log(`Stats After completion -> Donor (G) donations: ${donorDonationsAfter}, Recipient (F) received: ${recReceivedAfter}`);

    if (donorDonationsAfter !== donorDonationsBefore + 1) {
      throw new Error(`Donor donationsCount did not increment correctly. Expected: ${donorDonationsBefore + 1}, Got: ${donorDonationsAfter}`);
    }
    if (recReceivedAfter !== recReceivedBefore + 1) {
      throw new Error(`Recipient bloodReceivedCount did not increment correctly. Expected: ${recReceivedBefore + 1}, Got: ${recReceivedAfter}`);
    }
    console.log("Success: Statistics incremented correctly on completion!");

    // ==================================================
    // 6. PREVENT DOUBLE COUNTING STATS
    // ==================================================
    console.log("\n6. Testing double-completion protection...");
    const completeRes2 = await fetch(`${BASE_URL}/blood-requests/response/${responseId}/complete`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${tokenF}` }
    });
    const completeData2 = await completeRes2.json();
    if (completeRes2.ok) {
      throw new Error("Backend allowed double-completion of the same donation response!");
    } else {
      console.log(`Success: Backend blocked double-completion. Message: "${completeData2.message}"`);
    }

    // Verify stats did not increment again
    const profileDonorAfter2 = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenG}` }
    });
    const donorAfterData2 = await profileDonorAfter2.json();
    console.log("Donor donationsCount check:", donorAfterData2.user.donationsCount);
    if (donorAfterData2.user.donationsCount !== donorDonationsAfter) {
      throw new Error("Donor donationsCount was incremented twice!");
    }

    console.log("\n=== ALL BLOODBRIDGE PHASE 2 INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("\n!!! TEST FLOW FAILED !!!");
    console.error(err.message);
    process.exit(1);
  }
}

runTests();

// Blood group compatibility for RED CELL donation
// Key = donor blood group
// Value = recipient blood groups the donor can donate to

const bloodCompatibility = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],

  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],

  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],

  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"]
};

// Check whether donor can donate to recipient
const canDonate = (donorGroup, recipientGroup) => {
  if (!donorGroup || !recipientGroup) {
    return false;
  }

  const compatibleRecipients = bloodCompatibility[donorGroup];

  if (!compatibleRecipients) {
    return false;
  }

  return compatibleRecipients.includes(recipientGroup);
};

// Get all donor blood groups compatible with a recipient
const getCompatibleDonorGroups = (recipientGroup) => {
  if (!recipientGroup) {
    return [];
  }

  return Object.keys(bloodCompatibility).filter((donorGroup) =>
    bloodCompatibility[donorGroup].includes(recipientGroup)
  );
};

module.exports = {
  bloodCompatibility,
  canDonate,
  getCompatibleDonorGroups
};
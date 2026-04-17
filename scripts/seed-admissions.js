const { createDataStores } = require("../src/server/store/createDataStores");

const firstNames = [
  "Aarav", "Aisha", "Amit", "Anaya", "Arjun", "Diya", "Farhan", "Isha", "Kabir", "Karan",
  "Kiara", "Meera", "Mihir", "Mira", "Naina", "Neel", "Nikhil", "Pooja", "Priya", "Rhea",
  "Rohan", "Sara", "Siya", "Tanvi", "Vikram"
];

const lastNames = [
  "Agarwal", "Bhatia", "Chopra", "Desai", "Gupta", "Iyer", "Jain", "Kapoor", "Malhotra", "Mehta",
  "Mistry", "Nair", "Patel", "Rao", "Reddy", "Shah", "Sharma", "Singh", "Sood", "Verma"
];

const doctors = [
  "Dr. Raven", "Dr. Karim", "Dr. Nair", "Dr. Patel", "Dr. Shah", "Dr. Mehta", "Dr. Iyer", "Dr. Sinha"
];

const departments = [
  "Inpatient medicine", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Pulmonology", "Gastroenterology"
];

const diagnoses = [
  "Acute viral fever", "Chest pain evaluation", "Migraine observation", "Post-operative recovery",
  "Respiratory infection", "Diabetes monitoring", "Hypertension review", "Fracture management"
];

const allergies = [
  null, null, "Penicillin", "Peanuts", "Dust", "Seafood", "Latex"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Female", "Male", "Other"];
const statuses = ["Stable", "Observation", "Critical", "Discharge planned"];
const insuranceProfiles = ["Self-pay", "Corporate", "Private insurance", "Government plan"];
const wards = ["A1", "A2", "B1", "B2", "C1", "ICU", "Step-down"];

const getCountArgument = () => {
  const countArg = process.argv.slice(2).find(argument => argument.startsWith("--count="));
  if (!countArg) {
    return 120;
  }

  const parsed = Number.parseInt(countArg.split("=")[1], 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("Count must be a positive integer.");
  }

  return parsed;
};

const padNumber = value => String(value).padStart(4, "0");

const pickValue = (items, index, offset = 0) => items[(index + offset) % items.length];

const buildDate = index => {
  const baseDate = new Date(Date.UTC(2026, 0, 1));
  baseDate.setUTCDate(baseDate.getUTCDate() + index);
  return baseDate.toISOString().slice(0, 10);
};

const buildTime = index => {
  const hour = 8 + (index % 10);
  const minute = (index * 7) % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const buildDateOfBirth = age => {
  const year = 2026 - age;
  const month = ((age % 12) + 1);
  const day = ((age % 28) + 1);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const createAdmission = index => {
  const firstName = pickValue(firstNames, index);
  const lastName = pickValue(lastNames, index, Math.floor(index / 3));
  const fullName = `${firstName} ${lastName}`;
  const age = 18 + (index % 65);

  return {
    patientId: `PT${padNumber(index + 1)}`,
    admissionId: `ADM${padNumber(index + 1)}`,
    fullName,
    age,
    gender: pickValue(genders, index),
    dateOfBirth: buildDateOfBirth(age),
    mobileNumber: `55501${String(1000 + index).slice(-4)}`,
    address: `${10 + index} Green Avenue, Ward ${1 + (index % 9)}`,
    emergencyContact: `Family Contact ${index + 1}`,
    bloodGroup: pickValue(bloodGroups, index),
    insuranceProfileType: pickValue(insuranceProfiles, index),
    admissionDate: buildDate(index),
    admissionTime: buildTime(index),
    department: pickValue(departments, index),
    ward: pickValue(wards, index),
    room: `${100 + (index % 40)}`,
    bedNumber: `B-${1 + (index % 4)}`,
    doctor: pickValue(doctors, index),
    diagnosis: pickValue(diagnoses, index),
    allergies: pickValue(allergies, index),
    status: pickValue(statuses, index)
  };
};

const closeStoreConnections = async admissionStore => {
  if (admissionStore && admissionStore.pool && typeof admissionStore.pool.end === "function") {
    await admissionStore.pool.end();
  }
};

const seed = async () => {
  const targetCount = getCountArgument();
  const { kind, admissionStore } = await createDataStores();

  try {
    const existingItems = await admissionStore.list({ limit: null });
    const existingCount = existingItems.length;
    const recordsToCreate = Math.max(0, targetCount - existingCount);

    if (recordsToCreate === 0) {
      console.log(`Admission store already has ${existingCount} records. No seed data added.`);
      return;
    }

    for (let index = existingCount; index < targetCount; index += 1) {
      await admissionStore.create(createAdmission(index));
    }

    const finalItems = await admissionStore.list({ limit: null });
    console.log(`Seeded ${recordsToCreate} fake admissions into ${kind} storage. Total records: ${finalItems.length}.`);
  } finally {
    await closeStoreConnections(admissionStore);
  }
};

seed().catch(error => {
  console.error("Failed to seed admissions.");
  console.error(error);
  process.exit(1);
});

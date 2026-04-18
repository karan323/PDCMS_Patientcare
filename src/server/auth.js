const crypto = require("node:crypto");

const STAFF_ROLE_OPTIONS = [
  "Inpatient department admin / reception team",
  "Nurses",
  "Doctors",
  "Consultants",
  "Lab / report staff"
];

const PASSWORD_MIN_LENGTH = 8;
const TOKEN_LIFETIME_MS = 1000 * 60 * 60 * 12;

const cleanString = value => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const normalizeEmail = value => cleanString(value).toLowerCase();

const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const base64UrlEncode = value => Buffer.from(value).toString("base64url");
const base64UrlDecode = value => Buffer.from(value, "base64url").toString("utf8");

const readTokenSecret = () => {
  const configuredSecret = cleanString(process.env.AUTH_TOKEN_SECRET);
  return configuredSecret || "pdcms-dev-auth-secret";
};

const createPasswordHash = password => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
};

const verifyPasswordHash = (password, storedHash) => {
  const [salt, expectedHash] = String(storedHash || "").split(":");
  if (!salt || !expectedHash) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derivedKey, "hex"), Buffer.from(expectedHash, "hex"));
};

const buildSessionUser = staffUser => ({
  id: staffUser.id,
  fullName: staffUser.fullName,
  email: staffUser.email,
  role: staffUser.role
});

const createAuthToken = staffUser => {
  const payload = {
    sub: staffUser.id,
    fullName: staffUser.fullName,
    email: staffUser.email,
    role: staffUser.role,
    exp: Date.now() + TOKEN_LIFETIME_MS
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", readTokenSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
};

const verifyAuthToken = token => {
  const [encodedPayload, providedSignature] = String(token || "").split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", readTokenSecret())
    .update(encodedPayload)
    .digest("base64url");

  if (
    Buffer.from(providedSignature).length !== Buffer.from(expectedSignature).length ||
    !crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.sub || !payload?.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const validateStaffRegistrationPayload = payload => {
  const errors = [];
  const fullName = cleanString(payload?.fullName);
  const email = normalizeEmail(payload?.email);
  const password = cleanString(payload?.password);
  const role = cleanString(payload?.role);

  if (!fullName) {
    errors.push("Full name is required.");
  }

  if (!email || !isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }

  if (!STAFF_ROLE_OPTIONS.includes(role)) {
    errors.push("Select a valid staff profile.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      fullName,
      email,
      password,
      role
    }
  };
};

const validateStaffLoginPayload = payload => {
  const errors = [];
  const email = normalizeEmail(payload?.email);
  const password = cleanString(payload?.password);
  const role = cleanString(payload?.role);

  if (!email || !isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }

  if (!password) {
    errors.push("Password is required.");
  }

  if (!STAFF_ROLE_OPTIONS.includes(role)) {
    errors.push("Select a valid staff profile.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      email,
      password,
      role
    }
  };
};

const readBearerToken = request => {
  const header = String(request.headers.authorization || "");
  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

module.exports = {
  STAFF_ROLE_OPTIONS,
  buildSessionUser,
  createAuthToken,
  createPasswordHash,
  readBearerToken,
  validateStaffLoginPayload,
  validateStaffRegistrationPayload,
  verifyAuthToken,
  verifyPasswordHash
};

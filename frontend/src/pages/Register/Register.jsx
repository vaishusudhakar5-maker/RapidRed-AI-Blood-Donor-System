import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import logo from "../../assets/images/rapidred-logo.png";

import { registerUser } from "../../services/auth";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    blood_group: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Blood group validation
    if (!formData.blood_group) {
      setError("Please select your blood group.");
      return;
    }

    // Terms validation
    if (!termsAccepted) {
      setError(
        "Please read and accept the RapidRed Terms & Conditions to continue."
      );
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        blood_group: formData.blood_group,
      });

      navigate("/login");

    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        setError(
          error.response.data?.detail ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        setError(
          "Cannot connect to RapidRed API. Make sure FastAPI is running."
        );
      } else {
        setError(
          error.message ||
            "Registration failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-6 py-10">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-lg"
      >

        <Card>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={logo}
              alt="RapidRed"
              className="w-24"
            />
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-center text-red-600">
            Create Account
          </h1>

          <p className="text-center text-gray-500 mt-2 mb-8">
            Create one RapidRed account and use it whenever you need help
            or want to donate.
          </p>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Full Name */}
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            {/* Email */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />

            {/* Blood Group */}
            <div>
              <label className="font-semibold text-gray-700">
                Blood Group
              </label>

              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                required
                className="w-full mt-2 border border-gray-300 rounded-xl px-4 py-3 focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none"
              >
                <option value="">
                  Select Blood Group
                </option>

                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Password */}
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create password"
              required
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
            />

            {/* Terms */}
            <div
              className={`rounded-xl border p-4 transition ${
                !termsAccepted && error
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >

              <label className="flex items-start gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);

                    if (e.target.checked) {
                      setError("");
                    }
                  }}
                  className="mt-1 w-4 h-4 accent-red-600 cursor-pointer"
                />

                <span className="text-sm text-gray-600 leading-6">
                  I agree to the{" "}

                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Terms & Conditions
                  </button>

                  {" "}and acknowledge the RapidRed Privacy Guidelines.
                </span>

              </label>

            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </Button>

          </form>

          {/* Login Link */}
          <p className="text-center mt-8">
            Already have an account?

            <Link
              to="/login"
              className="text-red-600 font-semibold ml-2 hover:underline"
            >
              Login
            </Link>
          </p>

        </Card>

      </motion.div>


      {/* =========================================
          TERMS & CONDITIONS MODAL
      ========================================= */}

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTerms(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  RapidRed Terms & Conditions
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Please review these terms before creating your account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 text-xl transition"
              >
                ×
              </button>

            </div>


            {/* Content */}
            <div className="px-6 py-6 overflow-y-auto max-h-[60vh] space-y-6">

              <div>
                <h3 className="font-bold text-gray-800">
                  1. About RapidRed
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  RapidRed is an emergency blood-finder platform designed
                  to help connect patients, donors, hospitals and blood
                  banks. RapidRed is a coordination and information
                  platform and does not replace professional medical care.
                </p>
              </div>


              <div>
                <h3 className="font-bold text-gray-800">
                  2. Accurate Information
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  Users must provide accurate and truthful information,
                  including their name, contact information, blood group,
                  location and other information requested by the platform.
                </p>
              </div>


              <div>
                <h3 className="font-bold text-gray-800">
                  3. Donor Eligibility
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  Donors are responsible for ensuring that they meet
                  applicable blood-donation eligibility requirements.
                  RapidRed's eligibility questionnaire is intended as a
                  screening aid and does not replace professional medical
                  assessment.
                </p>
              </div>


              <div>
                <h3 className="font-bold text-gray-800">
                  4. Location Information
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  RapidRed may use location information to identify
                  compatible donors within an appropriate emergency
                  search radius. Users should only provide or share
                  location information they are comfortable using for
                  this purpose.
                </p>
              </div>


              <div>
                <h3 className="font-bold text-gray-800">
                  5. Contact & Consent
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  Contact information should be used only for legitimate
                  blood-donation coordination. Users must not misuse,
                  distribute or exploit another user's personal
                  information.
                </p>
              </div>


              <div>
                <h3 className="font-bold text-gray-800">
                  6. Emergency Situations
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  RapidRed should not be relied upon as the sole source
                  of emergency medical assistance. In a medical emergency,
                  users should contact the appropriate hospital,
                  healthcare professional or emergency service.
                </p>
              </div>


              <div>
                <h3 className="font-bold text-gray-800">
                  7. Responsible Use
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  Users must not create fraudulent blood requests,
                  impersonate another person, provide deliberately false
                  information, misuse donor contact information or use
                  RapidRed for purposes unrelated to legitimate blood
                  donation and emergency coordination.
                </p>
              </div>


              <div>
                <h3 className="font-bold text-gray-800">
                  8. Privacy
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  RapidRed may process account, location and blood-group
                  information to provide matching and emergency
                  coordination features. Production deployment should
                  implement appropriate privacy, security and data
                  protection measures.
                </p>
              </div>


              <div className="bg-red-50 border border-red-100 rounded-xl p-4">

                <p className="text-sm text-red-700 leading-6">
                  <strong>Important:</strong> These terms are intended
                  for the RapidRed prototype and hackathon demonstration.
                  A production healthcare platform should have its terms,
                  privacy policy and data practices reviewed by appropriate
                  legal and healthcare professionals.
                </p>

              </div>

            </div>


            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">

              <p className="text-xs text-gray-500">
                By creating an account, you agree to these terms.
              </p>

              <button
                type="button"
                onClick={() => {
                  setTermsAccepted(true);
                  setShowTerms(false);
                  setError("");
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
              >
                I Agree & Continue
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Register;
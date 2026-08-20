import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

import logo from "../../assets/images/rapidred-logo.png";

import { loginUser } from "../../services/auth";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // ==========================================
    // EMAIL VALIDATION
    // ==========================================

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError(
        "Please enter a valid email address, for example: yourname@gmail.com"
      );
      return;
    }

    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      console.log("Login request:", {
        email: email,
        password: "********",
      });

      const data = await loginUser({
        email: email,
        password: password,
      });

      console.log("Login response:", data);

      // ==========================================
      // CHECK RESPONSE
      // ==========================================

      if (!data?.access_token || !data?.user) {
        setError(
          "Login response is incomplete. Please try again."
        );
        return;
      }

      // ==========================================
      // SAVE JWT
      // ==========================================

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // ==========================================
      // SAVE USER
      // ==========================================

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // ==========================================
      // REMOVE OLD ROLE
      // ==========================================

      localStorage.removeItem("active_role");

      // ==========================================
      // GO TO ROLE SELECTION
      // ==========================================

      navigate("/select-role");

    } catch (error) {
      console.error("Login error:", error);

      // ==========================================
      // SERVER ERROR
      // ==========================================

      if (error.response) {
        const detail =
          error.response.data?.detail;

        // FastAPI validation error
        if (Array.isArray(detail)) {
          const messages = detail
            .map((item) => {
              if (
                item &&
                typeof item.msg === "string"
              ) {
                return item.msg;
              }

              if (typeof item === "string") {
                return item;
              }

              return "Invalid input";
            })
            .join(", ");

          setError(messages);

        } else if (
          typeof detail === "string"
        ) {
          setError(detail);

        } else if (
          error.response.status === 401
        ) {
          setError(
            "Invalid email or password."
          );

        } else if (
          error.response.status === 422
        ) {
          setError(
            "Please check your email and password."
          );

        } else {
          setError(
            `Login failed: ${error.response.status}`
          );
        }

      // ==========================================
      // NETWORK ERROR
      // ==========================================

      } else if (error.request) {
        setError(
          "Cannot connect to RapidRed API. Make sure FastAPI is running on port 8000."
        );

      // ==========================================
      // OTHER ERROR
      // ==========================================

      } else {
        setError(
          error.message ||
          "Login failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-6">

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
        }}
        className="w-full max-w-md"
      >

        <Card>

          {/* LOGO */}

          <div className="flex justify-center mb-6">

            <img
              src={logo}
              alt="RapidRed"
              className="w-24"
            />

          </div>

          {/* HEADING */}

          <h1 className="text-4xl font-bold text-center text-red-600">
            Welcome Back
          </h1>

          <p className="text-center text-gray-500 mt-2 mb-8">
            Sign in to continue saving lives.
          </p>

          {/* ERROR */}

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">

              {error}

            </div>
          )}

          {/* LOGIN FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            {/* PASSWORD */}

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            {/* OPTIONS */}

            <div className="flex justify-between text-sm">

              <label className="flex gap-2 items-center">

                <input
                  type="checkbox"
                />

                Remember Me

              </label>

              <button
                type="button"
                className="text-red-600 hover:underline"
              >
                Forgot Password?
              </button>

            </div>

            {/* LOGIN BUTTON */}

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing In..."
                : "Login"}
            </Button>

          </form>

          {/* REGISTER */}

          <p className="text-center mt-8">

            Don't have an account?

            <Link
              to="/register"
              className="text-red-600 font-semibold ml-2 hover:underline"
            >
              Register
            </Link>

          </p>

        </Card>

      </motion.div>

    </div>
  );
}

export default Login;
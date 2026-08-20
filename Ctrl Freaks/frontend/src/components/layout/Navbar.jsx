import { Link } from "react-router-dom";
import { FaTint } from "react-icons/fa";
import Button from "../ui/Button";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-red-100">

      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="bg-red-600 text-white w-12 h-12 rounded-xl flex justify-center items-center text-2xl shadow-lg">
            <FaTint />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-red-600">
              RapidRed
            </h2>

            <p className="text-xs text-gray-500">
              AI Blood Finder
            </p>
          </div>

        </Link>

        {/* Menu */}

        <nav className="hidden md:flex gap-10 font-medium">

          <Link className="hover:text-red-600 transition" to="/">
            Home
          </Link>

          <Link className="hover:text-red-600 transition" to="/features">
            Features
          </Link>

          <Link className="hover:text-red-600 transition" to="/about">
            About
          </Link>

          <Link className="hover:text-red-600 transition" to="/contact">
            Contact
          </Link>

        </nav>

        {/* Buttons */}

        <div className="flex gap-3">

  <Button variant="secondary" to="/login">
    Login
  </Button>

  <Button to="/register">
    Register
  </Button>

</div>

      </div>

    </header>
  );
}

export default Navbar;
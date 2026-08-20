import { motion } from "framer-motion";
import Button from "../ui/Button";
import StatCard from "../ui/StatCard";
import logo from "../../assets/images/rapidred-logo.png";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-100 min-h-screen flex items-center">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-red-200 rounded-full blur-3xl opacity-30 top-10 left-10"></div>

      <div className="absolute w-96 h-96 bg-red-300 rounded-full blur-3xl opacity-20 bottom-10 right-10"></div>

      <div className="relative max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >

          <span className="bg-red-100 text-red-600 px-5 py-2 rounded-full font-semibold">
            🚨 AI Powered Emergency Blood Finder
          </span>

          <h1 className="text-6xl font-extrabold mt-8 leading-tight">
            Saving Lives
            <span className="text-red-600">
              {" "}Through Smart Technology
            </span>
          </h1>

          <p className="text-gray-600 text-xl mt-8 leading-9">
            RapidRed connects blood donors,
            patients, hospitals and blood banks
            instantly using Artificial Intelligence,
            live location tracking and emergency alerts.
          </p>

          <div className="flex gap-5 mt-10 flex-wrap">

            <Button to="/request">
              Request Blood
            </Button>

            <Button variant="secondary" to="/register">
              Become Donor
            </Button>

          </div>

          <div className="grid grid-cols-3 gap-4 mt-14">

            <StatCard
              number="15K+"
              title="Donors"
            />

            <StatCard
              number="250+"
              title="Hospitals"
            />

            <StatCard
              number="6000+"
              title="Lives Saved"
            />

          </div>

        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative flex justify-center"
        >

          {/* Main Logo */}
          <img
            src={logo}
            alt="RapidRed"
            className="w-96 animate-pulse"
          />

          {/* Floating Card 1 */}
          <div className="absolute top-10 -left-8 bg-white rounded-2xl shadow-xl px-5 py-3">
            <h3 className="font-bold text-red-600">
              🤖 AI Match Found
            </h3>
            <p className="text-sm text-gray-500">
              3 Eligible Donors Nearby
            </p>
          </div>

          {/* Floating Card 2 */}
          <div className="absolute bottom-20 -right-8 bg-white rounded-2xl shadow-xl px-5 py-3">
            <h3 className="font-bold text-red-600">
              📍 Live Tracking
            </h3>
            <p className="text-sm text-gray-500">
              Donor • 2.1 km Away
            </p>
          </div>

          {/* Floating Card 3 */}
          <div className="absolute bottom-0 left-10 bg-white rounded-2xl shadow-xl px-5 py-3">
            <h3 className="font-bold text-red-600">
              🏥 Hospital Ready
            </h3>
            <p className="text-sm text-gray-500">
              Emergency Unit Available
            </p>
          </div>

        </motion.div>

      </div>

    </section>
  );
}

export default Hero;
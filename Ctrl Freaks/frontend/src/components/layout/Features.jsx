import {
  FaRobot,
  FaMapMarkerAlt,
  FaHospital,
  FaBell,
} from "react-icons/fa";

function Features() {
  const features = [
    {
      icon: <FaRobot className="text-5xl text-red-600" />,
      title: "AI Smart Matching",
      description:
        "Our AI quickly identifies the most suitable blood donors based on blood type, location, and eligibility.",
    },
    {
      icon: <FaMapMarkerAlt className="text-5xl text-red-600" />,
      title: "Live Location Tracking",
      description:
        "Locate nearby donors and hospitals instantly with integrated maps for faster emergency response.",
    },
    {
      icon: <FaHospital className="text-5xl text-red-600" />,
      title: "Hospital Network",
      description:
        "Connect with hospitals and blood banks to check availability and coordinate donations efficiently.",
    },
    {
      icon: <FaBell className="text-5xl text-red-600" />,
      title: "Instant Alerts",
      description:
        "Emergency notifications reach eligible donors immediately, reducing response time during critical situations.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold">
            Why Choose <span className="text-red-600">RapidRed?</span>
          </h2>

          <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
            RapidRed combines Artificial Intelligence with real-time
            communication to make emergency blood donation faster,
            smarter, and more reliable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-red-50 rounded-2xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="mb-6">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                {feature.title}
              </h3>

              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;
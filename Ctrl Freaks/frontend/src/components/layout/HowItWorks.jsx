import {
  FaClipboardList,
  FaRobot,
  FaUserCheck,
  FaHeart,
} from "react-icons/fa";

function HowItWorks() {
  const steps = [
    {
      icon: <FaClipboardList className="text-5xl text-red-600" />,
      title: "Request Blood",
      description:
        "Patients create an emergency blood request by selecting the blood group, hospital, and urgency level.",
    },
    {
      icon: <FaRobot className="text-5xl text-red-600" />,
      title: "AI Matches Donors",
      description:
        "RapidRed intelligently finds eligible donors nearby using blood compatibility, distance, and availability.",
    },
    {
      icon: <FaUserCheck className="text-5xl text-red-600" />,
      title: "Donor Accepts",
      description:
        "Eligible donors receive instant notifications and can accept or decline the request with one tap.",
    },
    {
      icon: <FaHeart className="text-5xl text-red-600" />,
      title: "Life Saved",
      description:
        "The donor reaches the hospital, completes the donation, and helps save a life.",
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold">
            How <span className="text-red-600">RapidRed</span> Works
          </h2>

          <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
            A simple, intelligent workflow that connects patients, donors,
            and hospitals in just a few steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition duration-300"
            >
              <div className="flex justify-center mb-6">
                {step.icon}
              </div>

              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-5 font-bold">
                {index + 1}
              </div>

              <h3 className="text-2xl font-semibold mb-4">
                {step.title}
              </h3>

              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
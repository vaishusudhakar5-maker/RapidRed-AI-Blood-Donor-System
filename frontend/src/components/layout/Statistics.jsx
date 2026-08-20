import { FaUsers, FaHospital, FaHandHoldingHeart, FaHeartbeat } from "react-icons/fa";

function Statistics() {
  const stats = [
    {
      icon: <FaUsers className="text-4xl text-red-600" />,
      number: "15,000+",
      title: "Registered Donors",
    },
    {
      icon: <FaHospital className="text-4xl text-red-600" />,
      number: "250+",
      title: "Hospitals",
    },
    {
      icon: <FaHandHoldingHeart className="text-4xl text-red-600" />,
      number: "8,500+",
      title: "Successful Donations",
    },
    {
      icon: <FaHeartbeat className="text-4xl text-red-600" />,
      number: "6,000+",
      title: "Lives Saved",
    },
  ];

  return (
    <section className="bg-red-50 py-16">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <div className="flex justify-center mb-4">{item.icon}</div>
            <h2 className="text-3xl font-bold">{item.number}</h2>
            <p className="text-gray-600 mt-2">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Statistics;
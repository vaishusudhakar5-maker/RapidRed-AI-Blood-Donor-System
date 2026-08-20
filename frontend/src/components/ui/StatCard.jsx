function StatCard({ number, title }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 text-center hover:-translate-y-2 hover:shadow-2xl transition duration-300">
      <h2 className="text-3xl font-bold text-red-600">
        {number}
      </h2>

      <p className="text-gray-500 mt-2">
        {title}
      </p>
    </div>
  );
}

export default StatCard;
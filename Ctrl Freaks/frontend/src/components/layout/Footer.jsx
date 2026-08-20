import { FaGithub, FaLinkedin, FaEnvelope, FaHeart } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-red-700 text-white py-12">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-10">

        <div>
          <h2 className="text-3xl font-bold mb-4">RapidRed</h2>

          <p className="text-red-100">
            AI-powered emergency blood finder connecting donors,
            patients, hospitals, and blood banks in real time.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">
            Quick Links
          </h3>

          <ul className="space-y-2 text-red-100">
            <li>Home</li>
            <li>About</li>
            <li>Features</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">
            Connect
          </h3>

          <div className="flex gap-5 text-2xl">
            <FaGithub className="hover:text-gray-300 cursor-pointer" />
            <FaLinkedin className="hover:text-gray-300 cursor-pointer" />
            <FaEnvelope className="hover:text-gray-300 cursor-pointer" />
          </div>
        </div>

      </div>

      <div className="border-t border-red-500 mt-10 pt-6 text-center text-red-100 flex justify-center items-center gap-2">

        Made with
        <FaHeart className="text-white" />
        by Team RapidRed

      </div>
    </footer>
  );
}

export default Footer;
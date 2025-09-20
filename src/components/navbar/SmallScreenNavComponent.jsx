import { X, Mail, UserPlus } from "lucide-react"; // icons
import { FiZap } from "react-icons/fi"; // lightning icon
import image from "../../assets/menuCar.jpeg"
import logo from "../../assets/logo.png"

export default function SmallScreenNavComponent({ onClose }) {
  return (
    <div className="md:hidden fixed top-0 right-0 h-full w-100 bg-white z-50 flex flex-col shadow-lg rounded-l-md">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-0 right-0 text-white text-3xl bg-blue-700"
      >
        <X size={28} />
      </button>

      {/* Profile Section */}
      <div className="flex flex-col  mt-12 space-y-4 border-b pb-6">
        <img
          src={image} 
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover ml-4"
        />
       <div class="w-full border-b border-gray-300"></div>
        <div className="text-center flex flex-col text-left ml-4 ">
          <h2 className="text-xl font-bold text-blue-900">Hello.</h2>
          <p className="text-gray-600 text-sm max-w-xs">
            Create a profile to add payment methods, create favourites and more.
          </p>
        </div>
        <button className="bg-blue-700 text-white px-6 py-2 rounded-md w-40 font-semibold ml-4">
          SIGN UP
        </button>
      </div>

      {/* Menu Section */}
      <div className="flex flex-col ">
        {/* What's New */}
        <div className="flex items-center gap-3 p-4">
          <div className="relative">
            <FiZap size={22} className="text-black" />
            
          </div>
          <span className="font-medium text-gray-800">What's New</span>
        </div>

        {/* Contact us */}
        <div className="flex items-center gap-3 p-4">
          <Mail size={22} className="text-black" />
          <span className="font-medium text-gray-800">Contact us</span>
        </div>
      </div>

    

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col  space-y-4">
          {/* Login Row */}
      <div className="bg-gray-100 flex w-full items-center gap-3 p-4 mt-2">
        <UserPlus size={22} className="text-black" />
        <span className="font-medium text-gray-800">Log in</span>
      </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="w-12 h-12 border-2 border-blue-600 rounded-full flex items-center justify-center">
           
          </div>
          <img
            src={logo} // replace with Silver Service logo
            alt="Silver Service"
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
}
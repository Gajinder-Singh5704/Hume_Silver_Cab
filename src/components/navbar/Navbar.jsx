import { NavLink } from "react-router-dom";
import { useState } from "react";
import images from "../../assets/images";
import { IoMenu } from "react-icons/io5";
import SmallScreenNavComponent from "./SmallScreenNavComponent";
import MdScreenNavComponent from "./MdScreenNavComponent";
import { navItems } from "../../data/data.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-[#f9f6f3] relative">
      <nav className="flex items-center justify-between pt-2 pb-2 text-[16px]">
        {/* logo section */}
        <div className="ml-2 md:ml-6">
          <img src={images.logo} alt="logo" className="h-[60px] rounded-lg shadow-[4px_4px_10px_rgba(0,0,0,0.55)]" />
        </div>
        {/* nav links section */}
        <div className="flex md:space-x-8 space-x-4 md:mr-4 mr-1 items-center ">
          <ul className="flex md:space-x-8 space-x-4 cursor-pointer  ">
            {navItems.map((item, index) => (
              <li key={index} className="text-[#454545] hover:text-[#000]">
                <NavLink to={item.path}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
          {/* <button className=" text-[#454545] hover:text-[#000] cursor-pointer ">
            Log in
          </button>
          <button className="hidden md:flex bg-[#145086] text-[#fff] px-8 py-2  cursor-pointer x">
            Sign up
          </button> */}

          <button className="hidden" onClick={toggleMenu}>
            <IoMenu size={32} />
          </button>
          {isOpen && <MdScreenNavComponent />}

          {isOpen && <SmallScreenNavComponent onClose={toggleMenu} />}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

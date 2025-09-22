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
      <nav className="flex items-center justify-between pt-4 pb-4 text-[16px]">
        {/* logo section */}
        <div className="ml-8">
          <img src={images.logo} alt="logo" className="h-[50px]" />
        </div>
        {/* nav links section */}
        <div className="flex space-x-8 mr-4 items-center ">
          <ul className="flex space-x-8  cursor-pointer  ">
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

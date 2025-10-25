// components/Header.tsx
import VideoConnectLogo from "./VideoConnectLogo";


const Header = () => {
  return (
    <header className="bg-gray-900 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-2 py-3">
        <div className="flex justify-between items-center">
            <VideoConnectLogo width={150} height={40} className="opacity-80" />


          <nav className="hidden md:flex space-x-8">
            
            {/* <a
              href="#download"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Download
            </a> */}
          </nav>

          <div className="flex space-x-4">
            <button className="px-4 py-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Sign In
            </button>
            {/* <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
              Try Free
            </button> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

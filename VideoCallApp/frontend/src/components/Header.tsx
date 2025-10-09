// components/Header.tsx
import VideoConnectLogo from "./VideoConnectLogo";

interface headerProps{
  handleScroll: (props:string)=>void;
}

const Header: React.FC<headerProps> = ({handleScroll}) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-2 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8" fill="white" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              </svg>
            </div>

            <VideoConnectLogo width={150} height={40} className="opacity-80" />
          </div>

          <nav className="hidden md:flex space-x-8">
            <a
              // href="#features"
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={()=>{
                handleScroll('features')
              }}

            >
              Features
            </a>
            <a
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={()=>{
                console.log("This is should first ")
                handleScroll('howitworks');
              }}
            >
              How It Works
            </a>
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

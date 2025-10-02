// components/Features.tsx
import React from "react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}
interface FeatureProps {
  featureRef: React.RefObject<HTMLDivElement | null>;
}

const Features: React.FC<FeatureProps> = ({ featureRef }) => {
  const features: Feature[] = [
    {
      icon: 
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <circle
            cx="12"
            cy="8"
            r="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 20c0-3 6-3 6-3s6 0 6 3v2H6v-2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>,

      title: "Friend Calling",
      description:
        "Instant video calls with your friends. One tap and you're connected with crystal-clear quality.",
      color: "blue",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 0 1-6 0"
          />
        </svg>
      ),
      title: "Smart Notifications",
      description:
        "Get instant call alerts even when the app is closed. Never miss an important call again.",
      color: "green",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="2"
            ry="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* <!-- User / person -->
  <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9 20c0-2 6-2 6 0v1H9v-1z" strokeLinecap="round" strokeLinejoin="round"/> */}
        </svg>
      ),
      title: "Virtual Backgrounds",
      description:
        "Choose from beautiful backgrounds or blur your surroundings for professional-looking calls.",
      color: "purple",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8a9.953 9.953 0 0 1-4-.8L3 20l1.8-4a9.953 9.953 0 0 1-.8-4c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      title: "In-Call Chat",
      description:
        "Share messages, files, and links while on video calls without interrupting the conversation.",
      color: "orange",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <circle
            cx="8"
            cy="10"
            r="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="16"
            cy="10"
            r="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 20c0-2 6-2 6 0v1H5v-1zM13 20c0-2 6-2 6 0v1h-6v-1z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: "Group Video Calls",
      description:
        "Connect with multiple friends simultaneously. Perfect for team meetings or group hangouts.",
      color: "red",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8"
        >
          <path d="M12 2C9.238 2 7 4.238 7 7v3h10V7c0-2.762-2.238-5-5-5z" />

          <rect x="4" y="10" width="16" height="12" rx="2" ry="2" />
        </svg>
      ),
      title: "End-to-End Encryption",
      description:
        "Your conversations are private and secure. We use military-grade encryption for all calls.",
      color: "indigo",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600",
    };
    return colors[color] || colors.blue;
  };

  return (
    <section id="features" ref={featureRef} className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Amazing Features for
            <span className="text-blue-600"> Better Connections</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for seamless video communication with friends,
            family, and colleagues.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-gray-200"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${getColorClasses(
                  feature.color
                )} flex items-center justify-center text-2xl mb-6`}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional feature highlights */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">4K</div>
            <div className="text-gray-600">Video Quality</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime Guarantee</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
            <div className="text-gray-600">Free Calls</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

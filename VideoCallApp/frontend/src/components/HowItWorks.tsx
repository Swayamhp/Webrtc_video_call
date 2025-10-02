// components/HowItWorks.tsx
import React from 'react';
interface Props{
  howItworksRef:React.RefObject<HTMLDivElement | null>;
  }


const HowItWorks: React.FC<Props> = ({howItworksRef}) => {
  const steps = [
    {
      number: '01',
      title: 'Sign Up & Add Friends',
      description: 'Create your account and connect with friends using their username or phone number.'
    },
    {
      number: '02',
      title: 'Initiate Video Call',
      description: 'Tap the video call button next to any friend. They\'ll receive an instant notification.'
    },
    {
      number: '03',
      title: 'Connect Instantly',
      description: 'Your friend accepts the call and you\'re connected in crystal-clear HD video quality.'
    },
    {
      number: '04',
      title: 'Enjoy Features',
      description: 'Use in-call chat, virtual backgrounds, and other features during your conversation.'
    }
  ];

  return (
    <section id="how-it-works" ref={howItworksRef} className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Getting started with VideoConnect is simple and takes just minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {step.title}
              </h3>
              <p className="text-blue-100 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl">
            Start Your First Call Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
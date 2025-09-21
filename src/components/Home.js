import React from 'react';
import { Leaf, Shield, Zap, Users, Camera, FileText } from 'lucide-react';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: Camera,
      title: 'AI-Powered Detection',
      description: 'Upload plant images and get instant disease diagnosis using advanced AI technology.'
    },
    {
      icon: FileText,
      title: 'Symptom Analysis',
      description: 'Describe observed symptoms for more accurate disease identification and treatment recommendations.'
    },
    {
      icon: Shield,
      title: 'Expert Recommendations',
      description: 'Get professional treatment and prevention advice tailored to your specific plant disease.'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Receive immediate analysis and recommendations without waiting for expert consultation.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Plants Analyzed' },
    { number: '95%', label: 'Accuracy Rate' },
    { number: '50+', label: 'Disease Types' },
    { number: '24/7', label: 'Available' }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <Leaf className="hero-icon" />
            Plant Disease Detection Made Simple
          </h1>
          <p className="hero-description">
            Protect your plants with AI-powered disease detection. Upload a photo, 
            describe symptoms, and get instant professional recommendations for 
            treatment and prevention.
          </p>
          <div className="hero-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-placeholder">
            <Leaf size={120} />
            <p>AI Plant Analysis</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose PlantCare AI?</h2>
          <p>Advanced technology meets plant care expertise</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <IconComponent size={48} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in three simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Upload Image</h3>
              <p>Take a clear photo of your plant or upload an existing image</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Describe Symptoms</h3>
              <p>Tell us about any symptoms or changes you've noticed</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Get Results</h3>
              <p>Receive instant diagnosis and treatment recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Protect Your Plants?</h2>
          <p>Join thousands of plant lovers who trust PlantCare AI for their plant health needs</p>
          <div className="cta-buttons">
            <button className="cta-primary">Start Detection</button>
            <button className="cta-secondary">Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React from 'react';
import { Leaf, Users, Target, Award, Heart, Globe } from 'lucide-react';
import './About.css';

const About = () => {
  const team = [
    {
      name: 'AI Technology',
      role: 'Plant Disease Detection',
      description: 'Advanced machine learning algorithms trained on thousands of plant disease images'
    },
    {
      name: 'Plant Experts',
      role: 'Botanical Specialists',
      description: 'Professional botanists and plant pathologists providing expert knowledge'
    },
    {
      name: 'Tech Team',
      role: 'Software Development',
      description: 'Experienced developers creating user-friendly plant care solutions'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Accuracy',
      description: 'We strive for the highest accuracy in plant disease detection using cutting-edge AI technology.'
    },
    {
      icon: Heart,
      title: 'Care',
      description: 'Every plant matters. We provide personalized care recommendations for your green friends.'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Making plant care knowledge accessible to everyone, everywhere, anytime.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Continuously improving our technology and services to serve you better.'
    }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>About PlantCare AI</h1>
          <p className="hero-subtitle">
            Empowering plant lovers with AI-powered disease detection and expert care recommendations
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At PlantCare AI, we believe that every plant deserves the best care possible. 
                Our mission is to democratize plant health knowledge by making professional-grade 
                disease detection and treatment recommendations accessible to everyone.
              </p>
              <p>
                Whether you're a seasoned gardener or just starting your plant journey, 
                we're here to help you keep your plants healthy, happy, and thriving.
              </p>
            </div>
            <div className="mission-image">
              <div className="mission-placeholder">
                <Leaf size={100} />
                <p>Healthy Plants, Happy Gardeners</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="value-card">
                  <div className="value-icon">
                    <IconComponent size={48} />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="container">
          <div className="tech-content">
            <div className="tech-text">
              <h2>Advanced Technology</h2>
              <p>
                Our platform uses state-of-the-art artificial intelligence and machine learning 
                algorithms to analyze plant images and symptoms. Trained on extensive datasets 
                of plant diseases, our AI can identify issues with remarkable accuracy.
              </p>
              <ul className="tech-features">
                <li>Computer Vision for Image Analysis</li>
                <li>Natural Language Processing for Symptom Description</li>
                <li>Machine Learning for Disease Classification</li>
                <li>Expert Knowledge Base Integration</li>
              </ul>
            </div>
            <div className="tech-stats">
              <div className="stat">
                <div className="stat-number">95%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
              <div className="stat">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Images Analyzed</div>
              </div>
              <div className="stat">
                <div className="stat-number">50+</div>
                <div className="stat-label">Disease Types</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Our Team</h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-icon">
                  <Users size={40} />
                </div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <h2>Get in Touch</h2>
            <p>
              Have questions about plant care or our technology? We'd love to hear from you!
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Email:</strong> support@plantcareai.com
              </div>
              <div className="contact-item">
                <strong>Phone:</strong> +1 (555) 123-4567
              </div>
              <div className="contact-item">
                <strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM EST
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

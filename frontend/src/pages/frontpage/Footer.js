import React from 'react';
import { Twitter, Facebook, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    aboutUs: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Offices', href: '#offices' },
      { name: 'Press', href: '#press' },
      { name: 'Careers', href: '#careers' },
      { name: 'Supporter Care', href: '#support' }
    ],
    policies: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'POSH Policy', href: '#posh' },
      { name: 'Copyright and Terms', href: '#terms' },
      { name: 'Community Policy', href: '#community' },
      { name: 'Sitemap', href: '#sitemap' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#twitter' },
    { name: 'Facebook', icon: Facebook, href: '#facebook' },
    { name: 'YouTube', icon: Youtube, href: '#youtube' },
    { name: 'Instagram', icon: Instagram, href: '#instagram' }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">About</h3>
            <ul className="footer-links">
              {footerLinks.aboutUs.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer-link">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Policies</h3>
            <ul className="footer-links">
              {footerLinks.policies.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer-link">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Follow Us</h3>
            <div className="social-links">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a key={index} href={social.href} className="social-link" aria-label={social.name}>
                    <IconComponent size={24} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; Symbiosis India 2025</p>
            <p className="license-text">
              Unless otherwise stated, the copy of the website is licensed under a{' '}
              <a href="#cc-license" className="license-link">CC-BY International License</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

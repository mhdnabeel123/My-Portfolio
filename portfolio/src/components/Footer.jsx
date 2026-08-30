import { personalInfo } from '../data/resumeData';

const Footer = () => {
  return (
    <footer>
      <p>
        Design & Built by <span style={{ fontWeight: 600 }}>{personalInfo.name}</span>
        <br />
        <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', display: 'inline-block', opacity: 0.7 }}>
          © {new Date().getFullYear()} All rights reserved.
        </span>
      </p>
    </footer>
  );
};

export default Footer;

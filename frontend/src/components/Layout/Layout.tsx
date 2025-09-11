import React from 'react';
import { Container } from 'react-bootstrap';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar />
      <main className="flex-grow-1">
        <Container className="py-4">
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

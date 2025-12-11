// frontend/src/layout/Layout.jsx
import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";
import "../App.css";

export default function Layout({ children }) {
  return (
    <div className="vs-app">
      <SiteHeader />
      <main className="vs-main-shell">{children}</main>
      <Footer />
    </div>
  );
}

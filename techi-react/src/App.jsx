import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { useApp } from "./context.jsx";
import { CartDrawer, Cursor, Footer, Header, MeshBG, MobileMenu, Preloader, Toasts, Transition } from "./components/Chrome.jsx";
import Home from "./pages/Home.jsx";
import { About, Bundles, Experience, Product, Shop } from "./pages/Pages.jsx";
import { ScrollTrigger, gsap } from "./lib/motion.js";
import { reduceMotion } from "./lib/util.js";

export default function App() {
  const { lenis, lang } = useApp();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);

  /* smooth scroll wired into ScrollTrigger */
  useEffect(() => {
    if (reduceMotion()) return;
    const l = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.current = l;
    l.on("scroll", ScrollTrigger.update);
    const raf = (t) => l.raf(t * 1000);
    gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); l.destroy(); lenis.current = null; };
  }, [lenis]);

  useEffect(() => { if (ready) document.body.classList.remove("loading"); }, [ready]);
  useEffect(() => { setMenu(false); }, [location.pathname]);

  return (
    <>
      <MeshBG />
      <Cursor />
      <Preloader onReady={() => setReady(true)} />
      <Transition />
      <Header onMenu={() => setMenu(true)} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
      <main>
        {ready && (
          <Routes location={location} key={location.pathname + lang}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:cat" element={<Shop />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/bundles" element={<Bundles />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/experience/:dev" element={<Experience />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        )}
      </main>
      <Footer />
      <div className="hover-img" id="hoverImg" aria-hidden="true" />
      <CartDrawer />
      <Toasts />
    </>
  );
}

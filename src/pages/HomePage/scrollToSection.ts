// Scroll animado propio: el `behavior: "smooth"` nativo puede no animarse
// (p. ej. con las animaciones del sistema desactivadas), así que lo hacemos con rAF.

const MIN_DURATION = 600;
const MAX_DURATION = 1200;

let cancelCurrent: (() => void) | null = null;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function scrollToSection(targetId: string) {
  // Esperamos un frame para que cambios de layout previos (p. ej. cerrar el
  // menú móvil) ya estén aplicados al calcular la posición de destino.
  requestAnimationFrame(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    cancelCurrent?.();

    const root = document.documentElement;
    const startY = window.scrollY;
    const maxY = root.scrollHeight - window.innerHeight;
    const targetY = Math.min(
      Math.max(target.getBoundingClientRect().top + startY, 0),
      maxY
    );
    const distance = targetY - startY;
    if (Math.abs(distance) < 1) return;

    const duration = Math.min(
      MAX_DURATION,
      Math.max(MIN_DURATION, Math.abs(distance) * 0.6)
    );

    // El `scroll-behavior: smooth` global haría que cada paso se animara por su cuenta
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    let frameId = 0;
    let startTime: number | null = null;

    const cleanup = () => {
      cancelAnimationFrame(frameId);
      root.style.scrollBehavior = previousBehavior;
      window.removeEventListener("wheel", cleanup);
      window.removeEventListener("touchstart", cleanup);
      window.removeEventListener("keydown", cleanup);
      cancelCurrent = null;
    };

    // Si el usuario interactúa, le devolvemos el control del scroll
    window.addEventListener("wheel", cleanup, { passive: true });
    window.addEventListener("touchstart", cleanup, { passive: true });
    window.addEventListener("keydown", cleanup);

    const step = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        cleanup();
      }
    };

    cancelCurrent = cleanup;
    frameId = requestAnimationFrame(step);
  });
}

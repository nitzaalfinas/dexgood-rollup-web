import { MouseEvent } from "react";

/**
 * Function untuk scroll ke section tertentu khusus untuk elemen yang memiliki atribut href
 */
const scrollToSection = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  const href = event.currentTarget.getAttribute("href");
  const targetId = href ? href.slice(1) : "";
  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    window.scrollTo({
      top: targetElement.offsetTop - 90,
      behavior: "smooth",
    });
  }
};

/**
 * Function untuk scroll ke section tertentu khusus untuk elemen router
 * @param element Elemen khusus router
 */
const scrollToSectionRouter = (element: HTMLElement) => {
  window.scrollTo({
    top: element.offsetTop - 90,
    behavior: "smooth",
  });
};

export { scrollToSection, scrollToSectionRouter };

"use strict";

// Modal Window
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnsOpenModal = document.querySelectorAll(".btn--show-modal");
const btnCloseModal = document.querySelector(".btn--close-modal");

const openModal = function (e) {
    e.preventDefault();
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
};
const closeModal = function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
}
btnsOpenModal.forEach(btn => btn.addEventListener("click", openModal));
btnCloseModal.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal()
});

// Button Scrolling
const btnScrollTo = document.querySelector(".btn--scroll-to");
btnScrollTo.addEventListener("click", function () {
    document.querySelector("#section--1").scrollIntoView({ behavior: "smooth" });
});

// Page Navigation
document.querySelector(".nav__links").addEventListener("click", function (e) {
    e.preventDefault();
    if (!e.target.classList.contains("nav__link")) return;
    document.querySelector(`${e.target.getAttribute("href")}`).scrollIntoView({ behavior: "smooth" });
})

// Tabbed component
const tabsContainer = document.querySelector(".operations__tab-container");
const tabs = document.querySelectorAll(".operations__tab");
const tabsContent = document.querySelectorAll(".operations__content");

tabsContainer.addEventListener("click", function (e) {
    const tab = e.target.closest(".operations__tab");
    if (!tab) return;
    tabs.forEach(t => t.classList.remove("operations__tab--active"));
    tab.classList.add("operations__tab--active");

    tabsContent.forEach(content => content.classList.remove("operations__content--active"));
    document.querySelector(`.operations__content--${tab.dataset.tab}`)
        .classList.add("operations__content--active");
});

// Menu Fade Animation
const nav = document.querySelector(".nav");
const handleHover = function (e) {
    const link = e.target;
    const siblings = link.closest(".nav").querySelectorAll(".nav__link");
    const logo = link.closest(".nav").querySelector("img");
    if (!link.classList.contains("nav__link")) return;

    siblings.forEach(sibling => {
        if (sibling !== link) sibling.style.opacity = this;
    });
    logo.style.opacity = this;
};
nav.addEventListener("mouseover", handleHover.bind(0.5));
nav.addEventListener("mouseout", handleHover.bind(1));

// Sticky Navigation
const header = document.querySelector(".header");
const stickyNav = function (entries) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) nav.classList.add("nav-sticky")
        else nav.classList.remove("nav-sticky");
    });
};
const headerObserver = new IntersectionObserver(stickyNav, {
    root: null,
    threshold: 0,
    rootMargin: `-${nav.getBoundingClientRect().height}px`
});
headerObserver.observe(header);

// Reveal Section
const sections = document.querySelectorAll(".section");
const revealSection = function (entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.remove("section--hidden");
            observer.unobserve(entry.target);
        }
    });
};
const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.2,
})
sections.forEach(section => {
    section.classList.add("section--hidden");
    sectionObserver.observe(section);
});

// Lazy Loading Image
const imgTargets = document.querySelectorAll("img[data-src]");
const loadImg = function (entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src;
            entry.target.addEventListener("load", () => {
                entry.target.classList.remove("lazy-img")
            });
            observer.unobserve(entry.target);
        }
    });
};

const imgObserver = new IntersectionObserver(loadImg, {
    root: null,
    threshold: 0,
    rootMargin: "300px",
});
imgTargets.forEach(img => imgObserver.observe(img));

// Slider Components
const btnLeft = document.querySelector(".slider__btn--left");
const btnRight = document.querySelector(".slider__btn--right");
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.querySelector(".dots");
const maxSlide = slides.length;
let curSlide = 0;

const createDots = function () {
    slides.forEach((_, i) => {
        const html = `<button class="dots__dot" data-slide="${i}"></button>`;
        dotsContainer.insertAdjacentHTML("beforeend", html)
    })
}
const activeDots = function (curSlide) {
    document.querySelectorAll(".dots__dot").forEach(dot => dot
        .classList.remove("dots__dot--active"));
    document.querySelector(`.dots__dot[data-slide="${curSlide}"]`)
        .classList.add("dots__dot--active");
}
const goToSlide = function (curSlide) {
    slides.forEach((s, i) => {
        s.style.transform = `translateX(${(i - curSlide) * 100}%)`;
    });
}
const nextSlide = function () {
    if (curSlide === maxSlide - 1) curSlide = 0;
    else curSlide += 1;
    goToSlide(curSlide);
    activeDots(curSlide)
};
const prevSlide = function () {
    if (curSlide === 0) curSlide = maxSlide - 1;
    else curSlide -= 1;
    goToSlide(curSlide);
    activeDots(curSlide)
}

goToSlide(curSlide);
createDots();
activeDots(curSlide);

btnRight.addEventListener("click", nextSlide)
btnLeft.addEventListener("click", prevSlide);
document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") nextSlide();
    else if (e.key === "ArrowLeft") prevSlide();
});
dotsContainer.addEventListener("click", function (e) {
    if (!e.target.classList.contains("dots__dot")) return;
    curSlide = Number(e.target.dataset.slide);
    goToSlide(curSlide)
    activeDots(curSlide)
});
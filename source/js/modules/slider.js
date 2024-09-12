import Swiper from "swiper";

class Slider {
  constructor() {
    this.sliderContainer = document.getElementById(`story`);
    this.sliderContainer.style.backgroundImage = `url("img/slide1.jpg"), linear-gradient(180deg, rgba(83, 65, 118, 0) 0%, #523E75 16.85%)`;
    this.storySlider = null;
  }

  setSlider() {
    if (window.innerWidth / window.innerHeight < 1 || window.innerWidth < 769) {
      this.storySlider = new Swiper(`.js-slider`, {
        pagination: {
          el: `.swiper-pagination`,
          type: `bullets`,
        },
        keyboard: {
          enabled: true,
        },
        on: {
          slideChange: () => {
            if (
              this.storySlider.activeIndex === 0 ||
              this.storySlider.activeIndex === 1
            ) {
              this.sliderContainer.style.backgroundImage = `url("img/slide1.jpg"), linear-gradient(180deg, rgba(83, 65, 118, 0) 0%, #523E75 16.85%)`;
            } else if (
              this.storySlider.activeIndex === 2 ||
              this.storySlider.activeIndex === 3
            ) {
              this.sliderContainer.style.backgroundImage = `url("img/slide2.jpg"), linear-gradient(180deg, rgba(45, 54, 179, 0) 0%, #2A34B0 16.85%)`;
            } else if (
              this.storySlider.activeIndex === 4 ||
              this.storySlider.activeIndex === 5
            ) {
              this.sliderContainer.style.backgroundImage = `url("img/slide3.jpg"), linear-gradient(180deg, rgba(92, 138, 198, 0) 0%, #5183C4 16.85%)`;
            } else if (
              this.storySlider.activeIndex === 6 ||
              this.storySlider.activeIndex === 7
            ) {
              this.sliderContainer.style.backgroundImage = `url("img/slide4.jpg"), linear-gradient(180deg, rgba(45, 39, 63, 0) 0%, #2F2A42 16.85%)`;
            }
          },
          resize: () => {
            this.storySlider.update();
          },
        },
        observer: true,
        observeParents: true,
      });
    } else {
      this.storySlider = new Swiper(`.js-slider`, {
        slidesPerView: 2,
        slidesPerGroup: 2,
        pagination: {
          el: `.swiper-pagination`,
          type: `fraction`,
        },
        navigation: {
          nextEl: `.js-control-next`,
          prevEl: `.js-control-prev`,
        },
        keyboard: {
          enabled: true,
        },
        on: {
          slideChange: () => {
            if (this.storySlider.activeIndex === 0) {
              this.sliderContainer.style.backgroundImage = `url("img/slide1.jpg")`;
            } else if (this.storySlider.activeIndex === 2) {
              this.sliderContainer.style.backgroundImage = `url("img/slide2.jpg")`;
            } else if (this.storySlider.activeIndex === 4) {
              this.sliderContainer.style.backgroundImage = `url("img/slide3.jpg")`;
            } else if (this.storySlider.activeIndex === 6) {
              this.sliderContainer.style.backgroundImage = `url("img/slide4.jpg")`;
            }
          },
          resize: () => {
            this.storySlider.update();
          },
        },
        observer: true,
        observeParents: true,
      });
    }
  }

  init() {
    window.addEventListener(`resize`, () => {
      if (this.storySlider) {
        this.storySlider.destroy();
      }
      this.setSlider();
    });

    this.setSlider();
  }
}

export default new Slider();

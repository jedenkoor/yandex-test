class Init {
  constructor() {
    this.init();
  }

  init() {
    this.events();

    if (document.querySelectorAll('.slider').length) {
      const sliders = document.querySelectorAll('.slider');
      sliders.forEach((item) => {
        this.actions().initSlider(item);
      })
    }
  }

  events() {
    const scrollers = document.querySelectorAll('.hero__btn');
    scrollers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.actions().scrollTo(e.currentTarget.dataset.anchor);
      })
    })
  }

  actions() {
    return {
      scrollTo (selector, offset = 0) {
        const el = document.querySelector(selector);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY + offset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          console.error('Элемент не найден:', selector);
        }
      },
      initSlider (wrapper) {
        // Интерактивные элементы слайдера
        const items = wrapper.querySelector('.slider__slides');
        const counter = wrapper.querySelector('.slider__counter');
        const currentSlideForCounter = counter?.querySelector('span:first-child')
        const autoplay = Number(wrapper.dataset.autoplay);
        const isLoop = Number(wrapper.dataset.loop);
        const isDots = Number(wrapper.dataset.dots);
        const dots = wrapper.querySelector('.slider__dots');
        const prev = wrapper.querySelector('.slider__btn.--prev');
        const next = wrapper.querySelector('.slider__btn.--next');

        // Параметры для инициализации и переключения
        let posInitial = 0;
        const slides = items.children;
        const slidesLength = slides.length;
        const slideSize = items.children[0].offsetWidth;
        const firstSlide = slides[0];
        const secondSlide = slides[1];
        const penultSlide = slides[slidesLength - 2];
        const lastSlide = slides[slidesLength - 1];
        const cloneFirst = firstSlide.cloneNode(true);
        const cloneSecond = secondSlide.cloneNode(true);
        const clonePenult = penultSlide.cloneNode(true);
        const cloneLast = lastSlide.cloneNode(true);
        let index = 1;
        let allowShift = true;

        // Добавляем клоны сзади и спереди для зацикленности (если есть)
        if (!isNaN(isLoop)) {
          items.appendChild(cloneFirst);
          items.appendChild(cloneSecond);
          items.insertBefore(clonePenult, firstSlide);
          items.insertBefore(cloneLast, firstSlide);
        } else {
          items.style.left = 0  + 'px';
          prev.classList.add('--disabled');
        }

        // Заполняем счетчик (если есть)
        if (counter) {
          counter.querySelector('span:last-child').innerHTML = slidesLength;
          currentSlideForCounter.innerHTML = window.innerWidth > 767 ? index + 2 : index;
        }

        // Заполняем дотсы (если есть)
        if (!isNaN(isDots)) {
          for (let i = 0; i < slidesLength; i++) {
            const span = document.createElement('span');
            dots.appendChild(span);
          }
          dots.querySelector('span').classList.add('--active');
        }

        // Запускаем автопрокрутку (если есть)
        let autoplayTimer
        if (autoplay) {
          autoplayTimer = setInterval(() => {
            if (
              !isNaN(isLoop) ||
              (window.innerWidth > 767 && index + 2 < slidesLength) ||
              (window.innerWidth <= 767 && index < slidesLength)
            ) {
              shiftSlide('right');
            }
          }, autoplay)
        }

        // Клики по стрелкам
        prev.addEventListener('click', function () {
          clearInterval(autoplayTimer);

          if (!isNaN(isLoop) || index > 1 || index === 0) {
            shiftSlide('left');
          }
        });

        next.addEventListener('click', function () {
          clearInterval(autoplayTimer);
          if (
            !isNaN(isLoop) ||
            (window.innerWidth > 767 && index + 2 < slidesLength) ||
            (window.innerWidth <= 767 && index < slidesLength)
          ) {
            shiftSlide('right');
          }
        });

        // Остановка прокрутки
        items.addEventListener('transitionend', checkIndex);

        function shiftSlide(dir) {
          items.classList.add('--shifting');

          if (allowShift) {
            posInitial = items.offsetLeft;

            if (dir === 'right') {
              items.style.left = (posInitial - slideSize) + 'px';
              index++;
            } else if (dir === 'left') {
              items.style.left = (posInitial + slideSize) + 'px';
              index--;
            }
          }

          allowShift = false;
        }

        function checkIndex (){
          items.classList.remove('--shifting');

          if (index === -1) {
            items.style.left = -(slidesLength * slideSize) + 'px';
            index = slidesLength - 1;
          }

          if (!isNaN(isLoop)) {
            if (index === slidesLength) {
              items.style.left = -(slideSize) + 'px';
              index = 0;
            }
          }

          if (isNaN(isLoop)) {
            if (index - 1 === slidesLength) {
              items.style.left = 0 + 'px';
              index = 0;
            }
          }

          // Изменяем счетчик после переключения слайдов (если есть)
          if (counter) {
            if (window.innerWidth > 767) {
              currentSlideForCounter.innerHTML = index > slidesLength - 2 ? 1 : index + 2;
            } else {
              currentSlideForCounter.innerHTML = index || slidesLength;
            }
          }

          // Блокируем кнопки после переключения если достигли конца
          if (isNaN(isLoop)) {
            const newIndex = index || slidesLength
            if (newIndex > 1) {
              prev.classList.remove('--disabled');
            } else {
              prev.classList.add('--disabled');
            }
            if (newIndex >= slidesLength) {
              next.classList.add('--disabled');
            } else {
              next.classList.remove('--disabled');
            }
          }

          // Меняем активный дотс (если есть)
          if (!isNaN(isDots)) {
            dots.querySelector('span.--active').classList.remove('--active');
            dots.querySelector(`span:nth-child(${index || slidesLength})`)?.classList.add('--active');
          }

          allowShift = true;
        }
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.controller = new Init();
});
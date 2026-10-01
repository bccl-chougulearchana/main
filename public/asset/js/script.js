window.addEventListener('scroll', function(){
    var header = document.querySelector('header');
    var logo = document.querySelector('.logo_img');
    var scrollPosition = window.scrollY;

    // Toggle sticky class based on scroll position
    header.classList.toggle('sticky', scrollPosition > 0);



});
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-content");

hamburger.addEventListener("click",()=>{
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});


// Data tab js
document.addEventListener('DOMContentLoaded', function() {
    var tabs = document.querySelectorAll('.tab-header li');
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabs.forEach(function(t) {
                t.classList.remove('active');
            });
            this.classList.add('active');
            var dataTab = this.getAttribute('data-tab');
            var tabContents = document.querySelectorAll('.tab-box');
            tabContents.forEach(function(content) {
                content.classList.remove('active');
                if (content.id === dataTab) {
                    content.classList.add('active');
                }
            });
        });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    var tabs = document.querySelectorAll('.tab-header1 li');
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabs.forEach(function(t) {
                t.classList.remove('active');
            });
            this.classList.add('active');
            var dataTab = this.getAttribute('data-tab');
            var tabContents = document.querySelectorAll('.tab-box1');
            tabContents.forEach(function(content) {
                content.classList.remove('active');
                if (content.id === dataTab) {
                    content.classList.add('active');
                }
            });
        });
    });
});

// Swiper Corporate Slider js
const corporateSwiper = new Swiper('.corporate-slider', {
    slidesPerView: 1,
    effect: "coverflow",
    spaceBetween: 20,
    loop: true,
    autoplay: {
        enable: true,
        delay: 5000,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },

});


// Swiper emp-engage Slider js
let engageSwiper = null;

function initOrDestroySwiper() {
    if (window.innerWidth <= 768) { // Less than or equal to 768
        if (!engageSwiper) {
            engageSwiper = new Swiper('.emp-engage-slider', {
                slidesPerView: 1,
                effect: "coverflow",
                spaceBetween: 20,
                loop: true,
                autoplay: {
                    enable: true,
                    delay: 10000,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
            });
        }
    } else {
        if (engageSwiper) {
            engageSwiper.destroy(true, true);
            engageSwiper = null;
        }
    }
}


// Run on page load
initOrDestroySwiper();

// Run on window resize
window.addEventListener('resize', initOrDestroySwiper);



// Swiper leader Slider js
// const leaderSlider = new Swiper('.leader-slider', {
//     slidesPerView: 1,
//     spaceBetween: 20,
//     loop: true,
//     autoplay: {
//         enable: true,
//         delay:10000,
//     },
//     pagination: {
//         el: ".swiper-pagination",
//         clickable: true,
//     },
// });

const leaderSlider = new Swiper('.leader-swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: false,
    autoplay: {
        // enable: true,
        delay: 5000,
    },
    pagination: {
        el: ".leader-swiper-pagination",
        clickable: true,
    },
})

// Swiper Corporate Slider js
const humourSlider = new Swiper('.humour-slider', {
    slidesPerView: 4,
    spaceBetween: 20,
    loop: true,
    grabCursor: true,
    simulateTouch: true,
    // slidesPerGroup: 4,
    autoplay: {
        // enable: true,
        delay: 5000,
    },
    pagination: {
        // autoplay: true,
        el: ".swiper-pagination",
        clickable: true,
    },
    breakpoints: {
        320: {
            slidesPerView: 1,
            slidesPerGroup: 1
        },
        576: {
            slidesPerView: 2,
            slidesPerGroup: 2
        },
        769: {
            slidesPerView: 4,
            slidesPerGroup: 4
        },
    }
});



// Scroll Down js
// let hash = '.vco-section';
// let button = document.querySelector('.scroll-btn');
// console.log(document.querySelector(hash),button)
// button.addEventListener('click', () => {
    
//     let section = document.querySelector(hash);
//     if (section) {
//         let topPosition = section.getBoundingClientRect().top + window.scrollY - 60;
//         window.scrollTo({ top: topPosition, behavior: 'smooth' });
//     }
//     //history.pushState(null, null, document.location.hash = hash);
// })

// for window size of 1st page
const windowHeight = window.innerHeight; // Get the window inner height
const footContainerHeight = document.querySelector('.foot-container').offsetHeight; // Get the height of .foot-container

const remainingHeight = windowHeight - footContainerHeight; // Calculate the remaining height

// window.addEventListener('load', function() {
//     // Function to prevent default scrolling behavior
//     function preventDefault(event) {
//         event.preventDefault();
//     }

//     // Function to prevent scrolling via arrow keys
//     function preventDefaultForScrollKeys(event) {
//         const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
//         if (keys.includes(event.keyCode)) {
//             preventDefault(event);
//             return false;
//         }
//     }

//     // Add event listeners to prevent scrolling
//     window.addEventListener('wheel', preventDefault, { passive: false });
//     window.addEventListener('touchmove', preventDefault, { passive: false });
//     window.addEventListener('keydown', preventDefaultForScrollKeys, { passive: false });

//     setTimeout(function() {
//         document.querySelector('.top-image').classList.add('slide-up');
//         document.querySelector('.bottom-image').classList.add('slide-down');
//     }, 3000);

//     setTimeout(function() {
//         document.querySelector('.image-container').classList.add('z-index');
//         // Remove event listeners to allow scrolling again
//         window.removeEventListener('wheel', preventDefault, { passive: false });
//         window.removeEventListener('touchmove', preventDefault, { passive: false });
//         window.removeEventListener('keydown', preventDefaultForScrollKeys, { passive: false });
//     }, 4000);
// });

var accordionItems = document.querySelectorAll('.accordion-item');
// console.log(accordionItems);

accordionItems.forEach(item => {
    var title = item.querySelector('.accordion-title');
    // console.log(title);
    var content  = item.querySelector('.accordion-content');
    // console.log(content);

    title.addEventListener("click",(e)=>{    
        e.preventDefault();
        for(var i = 0; i < accordionItems.length; i++){
            if (accordionItems[i] != item){
                accordionItems[i].classList.remove("active");
            }
            else{
                item.classList.toggle("active");
            }
        }
    })
})

const accordionItems2 = document.querySelectorAll('.accordion-item');
 
accordionItems2.forEach(item => {
    item.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        const titles = document.querySelectorAll('.accordion-title');
       
        if (isActive) {
            titles.forEach(title => {
                title.style.borderRight = '1px solid #fff';
            });
        } else {
            titles.forEach(title => {
                title.style.borderRight = '';
            });
        }
    });
});

       /*accodian jquery */
       $(document).ready(function(){
        $(".accordian-heading").on("click", function(){
            $(this).next().slideToggle(500);
          $(this).toggleClass('active');
        });


        $(".poll-per").on("click", function(){
           $(".hide-section").show();
           $(".poll-section").hide();
         });

        document.querySelector('.select-wrapper').addEventListener('click', function() {
            this.querySelector('.select').classList.toggle('open');
        });
        for (const option of document.querySelectorAll(".custom-option")) {
            option.addEventListener('click', function() {
                if (!this.classList.contains('selected')) {
                    this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
                    this.classList.add('selected');
                    this.closest('.select').querySelector('.select__trigger span').textContent = this.textContent;
                }
            })
        }

        document.querySelector('.select-wrapper1').addEventListener('click', function() {
            this.querySelector('.select1').classList.toggle('open1');
        });
        for (const option of document.querySelectorAll(".custom-option1")) {
            option.addEventListener('click', function() {
                if (!this.classList.contains('selected1')) {
                    this.parentNode.querySelector('.custom-option1.selected1').classList.remove('selected1');
                    this.classList.add('selected1');
                    this.closest('.select1').querySelector('.select__trigger1 span').textContent = this.textContent;
                }
            })
        }

        document.querySelector('.select-wrapper1').addEventListener('click', function() {
            this.querySelector('.select1').classList.toggle('open1');
        });
        for (const option of document.querySelectorAll(".custom-option1")) {
            option.addEventListener('click', function() {
                if (!this.classList.contains('selected1')) {
                    this.parentNode.querySelector('.custom-option1.selected1').classList.remove('selected1');
                    this.classList.add('selected1');
                    this.closest('.select1').querySelector('.select__trigger1 span').textContent = this.textContent;
                }
            })
        }
      
    });
        $(document).ready(function(){
        const progress1 = document.querySelector('.progress-done');

progress1.style.width = progress1.getAttribute('data-done') + '%';
progress1.style.opacity = 1;

const progress2 = document.querySelector('.progress-done2');

progress2.style.width = progress2.getAttribute('data-done') + '%';
progress2.style.opacity = 1;

const progress3 = document.querySelector('.progress-done3');

progress3.style.width = progress3.getAttribute('data-done') + '%';
progress3.style.opacity = 1;

const progress4 = document.querySelector('.progress-done4');

progress4.style.width = progress4.getAttribute('data-done') + '%';
progress4.style.opacity = 1;



});
      /*accodian jquery */

  



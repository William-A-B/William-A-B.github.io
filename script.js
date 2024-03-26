const nav = document.querySelector('nav');
window.addEventListener('scroll', function(){
    if(document.documentElement.scrollTop > 20) {
        nav.classList.add('sticky');
    }
    else {
        nav.classList.remove('sticky');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.expand-btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const details = button.nextElementSibling;
            details.style.display = details.style.display === 'block' ? 'none' : 'block';
        });
    });
});

// document.addEventListener("DOMContentLoaded", function() {
//     var footer = document.querySelector("footer");
//     var lastScrollTop = 0;
//     var footerVisible = false;

//     window.addEventListener("scroll", function() {
//         var st = window.scrollY;
//         var windowHeight = window.innerHeight;
//         var documentHeight = document.body.offsetHeight;
//         var percentageToScroll = 0.9;

//         if (!footerVisible && (st + windowHeight) >= documentHeight * percentageToScroll) {
//             // Show the footer when the user has scrolled to 90% of the page height
//             footer.classList.add("footer-visible");
//             document.body.style.marginBottom = footer.offsetHeight + "px"; // Adjust margin-bottom of body to make space for the footer
//             footerVisible = true;
//         } else if (footerVisible && (st + windowHeight) < documentHeight * 0.9) {
//             // Hide the footer if the user scrolls back up above 90% of the page height
//             footer.classList.remove("footer-visible");
//             document.body.style.marginBottom = 0; // Reset margin-bottom of body
//             footerVisible = false;
//         }

//         lastScrollTop = st;
//     }, false);
// });


// MAIN SCROLL FEATURE (Use one above if not wanting fixed footer on home page)

// document.addEventListener("DOMContentLoaded", function() {
//     var isIndexPage = window.location.pathname === "/" || window.location.pathname.endsWith("index.html");
    
//     // Only apply special footer behavior on pages other than index.html
//     if (!isIndexPage) {
//         var footer = document.querySelector("footer");
//         footer.style.position = "fixed"; // Make footer fixed only on other pages
//         var lastScrollTop = 0;
//         var footerVisible = false;
//         footer.style.display = "none";
    
//         window.addEventListener("scroll", function() {
//             var st = window.scrollY;
//             var windowHeight = window.innerHeight;
//             var documentHeight = document.body.offsetHeight;
    
//             if (!footerVisible && (st + windowHeight) >= documentHeight * 0.9) {
//                 footer.classList.add("footer-visible");
//                 document.body.style.marginBottom = footer.offsetHeight + "px";
//                 footerVisible = true;
//             } else if (footerVisible && (st + windowHeight) < documentHeight * 0.9) {
//                 footer.classList.remove("footer-visible");
//                 document.body.style.marginBottom = 0;
//                 footerVisible = false;
//             }
    
//             lastScrollTop = st;
//         }, false);
//     }
// });

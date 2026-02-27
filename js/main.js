/* ===================================================
   HopeRise Foundation — Interactivity
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Navbar scroll effect ---
    const navbar = document.querySelector('.navbar');
    const handleScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // --- Mobile nav toggle ---
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggle) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });

        // Close mobile nav on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Scroll-triggered reveal animations ---
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // --- Animated counters ---
    const counters = document.querySelectorAll('[data-count]');
    let countersAnimated = false;

    const animateCounters = () => {
        if (countersAnimated) return;
        countersAnimated = true;

        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count, 10);
            const suffix = counter.dataset.suffix || '';
            const duration = 2000;
            const startTime = performance.now();

            const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

            const update = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutQuart(progress);
                const current = Math.floor(easedProgress * target);

                counter.textContent = current.toLocaleString() + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target.toLocaleString() + suffix;
                }
            };

            requestAnimationFrame(update);
        });
    };

    const statsSection = document.querySelector('.impact');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounters();
                statsObserver.unobserve(statsSection);
            }
        }, { threshold: 0.3 });
        statsObserver.observe(statsSection);
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Parallax on hero floats ---
    const floats = document.querySelectorAll('.hero-float');
    if (floats.length && window.innerWidth > 768) {
        window.addEventListener('mousemove', e => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            floats.forEach((f, i) => {
                const factor = (i + 1) * 0.5;
                f.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
            });
        }, { passive: true });
    }

    // --- Razorpay Donation Checkout ---
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmount');
    const donateBtn = document.getElementById('donateBtn');
    let selectedAmount = 1000; // Default ₹1,000

    // Amount button selection
    if (amountBtns.length) {
        amountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                amountBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedAmount = parseInt(btn.dataset.amount, 10);
                if (customAmountInput) customAmountInput.value = '';
            });
        });
    }

    // Custom amount overrides preset
    if (customAmountInput) {
        customAmountInput.addEventListener('input', () => {
            const val = parseInt(customAmountInput.value, 10);
            if (val > 0) {
                amountBtns.forEach(b => b.classList.remove('active'));
                selectedAmount = val;
            }
        });
    }

    // Donate button → open Razorpay checkout
    if (donateBtn) {
        donateBtn.addEventListener('click', () => {
            const amount = customAmountInput && customAmountInput.value
                ? parseInt(customAmountInput.value, 10)
                : selectedAmount;

            if (!amount || amount < 1) {
                alert('Please select or enter a valid donation amount.');
                return;
            }

            // ============================================================
            // ⚠️  REPLACE the key below with YOUR Razorpay API key
            //     Get it from: https://dashboard.razorpay.com/app/keys
            //     Use rzp_test_... for testing, rzp_live_... for production
            // ============================================================
            const options = {
                key: 'rzp_test_XXXXXXXXXX',       // ← YOUR KEY HERE
                amount: amount * 100,              // Razorpay expects paise
                currency: 'INR',
                name: 'HopeRise Foundation',
                description: 'Donation to HopeRise Foundation',
                image: 'https://miche-l-pixel.github.io/demo-repo/assets/hero.png',
                handler: function (response) {
                    // Payment successful
                    alert(
                        '🎉 Thank you for your generous donation of ₹' +
                        amount.toLocaleString() +
                        '!\n\nPayment ID: ' + response.razorpay_payment_id +
                        '\n\nYour support makes a real difference.'
                    );
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: ''
                },
                notes: {
                    purpose: 'Donation',
                    organization: 'HopeRise Foundation'
                },
                theme: {
                    color: '#009688'
                },
                modal: {
                    ondismiss: function () {
                        console.log('Razorpay checkout closed by user.');
                    }
                }
            };

            try {
                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function (response) {
                    alert(
                        'Payment failed. Please try again.\n\nReason: ' +
                        response.error.description
                    );
                });
                rzp.open();
            } catch (err) {
                alert(
                    'Payment gateway could not be loaded.\n\n' +
                    'Please make sure you have replaced the Razorpay API key in js/main.js'
                );
                console.error('Razorpay error:', err);
            }
        });
    }
});

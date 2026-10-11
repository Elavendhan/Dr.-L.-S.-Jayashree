/**
 * Dr. L.S. Jayashree Portfolio Website Script
 * Interactive features, Light/Dark theme, Modal manager, Lightbox,
 * and Dynamic Publication Database Search and Pagination.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // THEME MANAGER (DARK / LIGHT MODE)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyEl = document.body;
    
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') {
        bodyEl.classList.remove('dark-theme');
        bodyEl.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        bodyEl.classList.remove('light-theme');
        bodyEl.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    
    themeToggleBtn.addEventListener('click', () => {
        if (bodyEl.classList.contains('dark-theme')) {
            bodyEl.classList.remove('dark-theme');
            bodyEl.classList.add('light-theme');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('portfolio-theme', 'light');
        } else {
            bodyEl.classList.remove('light-theme');
            bodyEl.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('portfolio-theme', 'dark');
        }
    });

    // ==========================================
    // MOBILE NAVIGATION MENU
    // ==========================================
    const mobileToggleBtn = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    mobileToggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const isExpanded = navMenu.classList.contains('active');
        mobileToggleBtn.innerHTML = isExpanded ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });
    
    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });

    // ==========================================
    // SCROLL PROGRESS & STICKY HEADER
    // ==========================================
    const scrollProgress = document.getElementById('scroll-progress');
    const header = document.querySelector('.main-header');
    
    let isTicking = false;
    let cachedDocHeight = 0;
    
    const updateScrollMetrics = () => {
        const scrollTop = window.scrollY || window.pageYOffset;
        if (!cachedDocHeight || scrollTop === 0) {
            cachedDocHeight = document.documentElement.scrollHeight - window.innerHeight;
        }
        const scrolled = (scrollTop / (cachedDocHeight || 1)) * 100;
        if (scrollProgress) scrollProgress.style.width = scrolled + '%';
        
        if (header) {
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        isTicking = false;
    };
    
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(updateScrollMetrics);
            isTicking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        cachedDocHeight = document.documentElement.scrollHeight - window.innerHeight;
    }, { passive: true });

    // ==========================================
    // SCROLL SPY ACTIVE SECTION LINK HIGHLIGHT
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    
    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-30% 0px -60% 0px' // Trigger active state when section takes up the middle of viewport
    });
    
    sections.forEach(section => {
        scrollSpyObserver.observe(section);
    });

    // ==========================================
    // PRODUCT SECTIONS FILTERS
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    const commercializedBanner = document.getElementById('commercialized-intro-text');
    
    function applyProductFilter(filterValue) {
        productCards.forEach(card => {
            const status = card.getAttribute('data-status');
            if (filterValue === 'all' || status === filterValue || (filterValue === 'completed' && status === 'commercialized')) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        if (commercializedBanner) {
            if (filterValue === 'commercialized') {
                commercializedBanner.style.display = 'block';
            } else {
                commercializedBanner.style.display = 'none';
            }
        }
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            applyProductFilter(filterValue);
        });
    });

    // Initialize default filter state on DOM load
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    if (activeFilterBtn) {
        applyProductFilter(activeFilterBtn.getAttribute('data-filter'));
    }

    // ==========================================
    // PRODUCT MODALS CONTROLLER
    // ==========================================
    const modalTriggers = document.querySelectorAll('.product-modal-trigger');
    const modals = document.querySelectorAll('.modal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-target');
            const targetModal = document.getElementById(targetId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock body scroll
            }
        });
    });
    
    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Unlock body scroll
    };
    
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal by clicking outside content card
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Dynamic thumbnails in modal
    const thumbnails = document.querySelectorAll('.modal-thumb');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', (e) => {
            const parentModal = thumb.closest('.modal');
            const mainImg = parentModal.querySelector('.modal-main-img');
            
            // Remove active class from sibling thumbnails
            const siblingThumbs = parentModal.querySelectorAll('.modal-thumb');
            siblingThumbs.forEach(t => t.classList.remove('active'));
            
            thumb.classList.add('active');
            mainImg.src = thumb.src;
        });
    });

    // ==========================================
    // LIGHTBOX GALLERY FOR CERTIFICATES
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    
    lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const href = trigger.getAttribute('src') || trigger.getAttribute('href');
            
            // Verify if link points to image
            if (href && (href.endsWith('.jpg') || href.endsWith('.jpeg') || href.endsWith('.png'))) {
                lightboxImg.src = href;
                lightboxTitle.textContent = trigger.getAttribute('data-title') || 'Certificate View';
                lightboxDesc.textContent = trigger.getAttribute('data-desc') || '';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(m => closeModal(m));
            closeLightbox();
        }
    });

    // ==========================================
    // PUBLICATIONS SEARCH & PAGINATION ENGINE
    // ==========================================
    const searchInput = document.getElementById('pub-search');
    const yearFilter = document.getElementById('pub-year-filter');
    const typeFilter = document.getElementById('pub-type-filter');
    const pubListContainer = document.getElementById('pub-list-container');
    const visibleCountText = document.getElementById('visible-pubs-count');
    const totalCountText = document.getElementById('total-pubs-count');
    const paginationContainer = document.getElementById('pub-pagination');
    
    let allPublications = [];
    let filteredPublications = [];
    let currentPage = 1;
    const itemsPerPage = 8;
    
    // Classification heuristic for publications
    const getPublicationType = (pub) => {
        const publicationField = (pub.Publication || '').toLowerCase();
        const titleField = (pub.Title || '').toLowerCase();
        const publisherField = (pub.Publisher || '').toLowerCase();
        
        if (publicationField.includes('journal') || 
            publicationField.includes('transactions') || 
            publicationField.includes('letters') || 
            publicationField.includes('ieee access') || 
            publicationField.includes('mdpi') || 
            publicationField.includes('elsevier') || 
            publicationField.includes('springer') ||
            publicationField.includes('wiley') ||
            publicationField.includes('neural computing') ||
            publicationField.includes('science') ||
            publicationField.includes('biomedicine') ||
            publicationField.includes('rehabilitation') ||
            publicationField.includes('technology') ||
            publicationField.includes('forecasting') ||
            publicationField.includes('studies')) {
            return 'journal';
        }
        
        if (publicationField.includes('conference') || 
            publicationField.includes('proceedings') || 
            publicationField.includes('wocn') || 
            publicationField.includes('tencon') || 
            publicationField.includes('congress') || 
            publicationField.includes('symposium') || 
            publicationField.includes('workshop') ||
            publicationField.includes('aisgsc')) {
            return 'conference';
        }
        
        if (publicationField.includes('chapter') || 
            publicationField.includes('book') || 
            titleField.includes('getting started with enterprise internet of things') ||
            titleField.includes('artificial intelligence, smart grid and smart city applications')) {
            return 'book';
        }
        
        // Default based on publisher or standard index
        if (publisherField.includes('ieee') || publisherField.includes('springer')) {
            return 'conference'; // typical default for raw computer science publications
        }
        
        return 'journal';
    };

    // Heuristic helper to categorize publications for the donut chart index breakdown
    const getChartCategory = (pub) => {
        const q = pub.Quartile || 'Others';
        const type = getPublicationType(pub);
        
        if (q.includes('Q1') || q.includes('Q2') || q.includes('Q3') || q.includes('Q4')) {
            return 'Quartile Journals (Q1-Q4)';
        }
        
        const pubName = (pub.Publication || '').toLowerCase();
        const publisher = (pub.Publisher || '').toLowerCase();
        
        const isScopus = pubName.includes('springer') || pubName.includes('ieee') || 
                        pubName.includes('elsevier') || pubName.includes('scopus') ||
                        publisher.includes('ieee') || publisher.includes('springer') ||
                        publisher.includes('elsevier') || publisher.includes('acm');
                        
        if (type === 'journal') {
            return isScopus ? 'Scopus Indexed Journals' : 'Google Scholar Indexed Journals';
        } else {
            return isScopus ? 'Scopus Indexed Conferences' : 'Google Scholar Indexed Conferences';
        }
    };

    // Dynamic Donut Chart Recalculation Engine
    const updateDonutChart = () => {
        const total = filteredPublications.length;
        
        // Count occurrences
        let counts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Others: 0 };
        filteredPublications.forEach(pub => {
            const q = pub.Quartile || 'Others';
            if (q.includes('Q1')) counts.Q1++;
            else if (q.includes('Q2')) counts.Q2++;
            else if (q.includes('Q3')) counts.Q3++;
            else if (q.includes('Q4')) counts.Q4++;
            else counts.Others++;
        });
        
        const denom = total || 1;
        const p = {
            Q1: counts.Q1 / denom,
            Q2: counts.Q2 / denom,
            Q3: counts.Q3 / denom,
            Q4: counts.Q4 / denom,
            Others: counts.Others / denom
        };
        
        // Circumference (2 * PI * 30)
        const C = 188.496;
        
        const w = {
            Q1: p.Q1 * C,
            Q2: p.Q2 * C,
            Q3: p.Q3 * C,
            Q4: p.Q4 * C,
            Others: p.Others * C
        };
        
        const offset = {
            Q1: 0,
            Q2: -w.Q1,
            Q3: -(w.Q1 + w.Q2),
            Q4: -(w.Q1 + w.Q2 + w.Q3),
            Others: -(w.Q1 + w.Q2 + w.Q3 + w.Q4)
        };
        
        // Update circle slices
        const updateSlice = (id, width, off, count) => {
            const slice = document.getElementById(id);
            if (slice) {
                if (count === 0 || total === 0) {
                    slice.setAttribute('stroke-dasharray', `0 ${C}`);
                } else {
                    slice.setAttribute('stroke-dasharray', `${width.toFixed(2)} ${C}`);
                    slice.setAttribute('stroke-dashoffset', off.toFixed(2));
                }
            }
        };
        
        updateSlice('donut-q1', w.Q1, offset.Q1, counts.Q1);
        updateSlice('donut-q2', w.Q2, offset.Q2, counts.Q2);
        updateSlice('donut-q3', w.Q3, offset.Q3, counts.Q3);
        updateSlice('donut-q4', w.Q4, offset.Q4, counts.Q4);
        updateSlice('donut-others', w.Others, offset.Others, counts.Others);
        
        // Update Legend
        const updateLegendItem = (countId, pctId, count, percentage) => {
            const cntSpan = document.getElementById(countId);
            const pctSpan = document.getElementById(pctId);
            if (cntSpan) cntSpan.textContent = count;
            if (pctSpan) pctSpan.textContent = total > 0 ? `(${(percentage * 100).toFixed(1)}%)` : '(0.0%)';
        };
        
        updateLegendItem('leg-cnt-q1', 'leg-pct-q1', counts.Q1, p.Q1);
        updateLegendItem('leg-cnt-q2', 'leg-pct-q2', counts.Q2, p.Q2);
        updateLegendItem('leg-cnt-q3', 'leg-pct-q3', counts.Q3, p.Q3);
        updateLegendItem('leg-cnt-q4', 'leg-pct-q4', counts.Q4, p.Q4);
        updateLegendItem('leg-cnt-others', 'leg-pct-others', counts.Others, p.Others);
        
        // Update Center Value
        const centerVal = document.getElementById('donut-center-val');
        const centerLbl = document.getElementById('donut-center-lbl');
        if (centerVal) centerVal.textContent = total;
        
        // Setup Hover Behaviors
        const setupHover = (sliceId, labelText, countVal) => {
            const slice = document.getElementById(sliceId);
            if (slice) {
                slice.onmouseenter = () => {
                    if (centerVal) {
                        centerVal.textContent = countVal;
                        centerVal.style.fill = slice.getAttribute('stroke');
                    }
                    if (centerLbl) {
                        centerLbl.textContent = labelText;
                        centerLbl.style.fontSize = '2.8px'; // Slightly larger for better readability
                    }
                    slice.style.strokeWidth = '21px';
                };
                slice.onmouseleave = () => {
                    if (centerVal) {
                        centerVal.textContent = total;
                        centerVal.style.fill = 'var(--text-primary)';
                    }
                    if (centerLbl) {
                        centerLbl.textContent = 'Publications';
                        centerLbl.style.fontSize = '3.8px'; // Matches default inlined value
                    }
                    slice.style.strokeWidth = '16px';
                };
            }
        };
        
        setupHover('donut-q1', 'Q1 Journals', counts.Q1);
        setupHover('donut-q2', 'Q2 Journals', counts.Q2);
        setupHover('donut-q3', 'Q3 Journals', counts.Q3);
        setupHover('donut-q4', 'Q4 Journals', counts.Q4);
        setupHover('donut-others', 'Others (Conf/Unranked)', counts.Others);
    };

   // Inline publications database (prevents CORS fetch blocks when index.html is opened directly via file://)
    const publicationsDb = [];


        
    const renderPublications = () => {
        pubListContainer.innerHTML = '';
        visibleCountText.textContent = filteredPublications.length;
        
        if (filteredPublications.length === 0) {
            pubListContainer.innerHTML = `
                <div class="pub-loading">
                    <i class="fa-solid fa-magnifying-glass-minus"></i> No publications found matching your search and filter criteria.
                </div>`;
            paginationContainer.innerHTML = '';
            return;
        }
        
        // Calculate items for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredPublications.length);
        const pageItems = filteredPublications.slice(startIndex, endIndex);
        
        // Render cards
        pageItems.forEach(pub => {
            const pubType = getPublicationType(pub);
            const pubCard = document.createElement('article');
            pubCard.className = 'pub-card';
            
            // Format authors list for citation style (bolding Jayashree L S)
            let authorsFormatted = pub.Authors || 'Jayashree, L. S.';
            authorsFormatted = authorsFormatted.replace(/(Jayashree,\s*L\.?\s*S\.?|Jayashree,\s*LS|Jayashree\s*L\s*S|Jayashree\s*Subramanian)/g, '<strong>$1</strong>');
            
            // Build publication details text
            let detailParts = [];
            if (pub.Publication) detailParts.push(pub.Publication);
            if (pub.Volume) detailParts.push(`vol. ${pub.Volume}`);
            if (pub.Number) detailParts.push(`no. ${pub.Number}`);
            if (pub.Pages) detailParts.push(`pp. ${pub.Pages}`);
            if (pub.Publisher) detailParts.push(pub.Publisher);
            
            const typeLabelClass = pubType === 'journal' ? 'journal' : (pubType === 'conference' ? 'conference' : 'journal');
            const typeLabelText = pubType === 'journal' ? 'Journal' : (pubType === 'conference' ? 'Conference' : 'Book Chapter');
            
            pubCard.innerHTML = `
                <div class="pub-title-row">
                    <span class="pub-meta-tag ${typeLabelClass}">${typeLabelText}</span>
                    <span class="pub-meta-tag year">${pub.Year || 'N/A'}</span>
                    <h3 class="pub-card-title">${pub.Title || 'Untitled Research'}</h3>
                </div>
                <p class="pub-authors">${authorsFormatted}</p>
                <p class="pub-details">${detailParts.join(', ')}</p>
                <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
                    <a href="https://scholar.google.com/scholar?q=${encodeURIComponent('L S Jayashree ' + pub.Title)}" target="_blank" style="font-size: 0.8rem; font-weight: 600; color: var(--accent-color); display: inline-flex; align-items: center; gap: 4px;" class="pub-scholar-link">
                        <i class="fa-solid fa-square-arrow-up-right"></i> View on Google Scholar
                    </a>
                </div>
            `;
            
            pubListContainer.appendChild(pubCard);
        });
        
        renderPagination();
    };
    
    const renderPagination = () => {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
        
        if (totalPages <= 1) return;
        
        // Helper button
        const createPageButton = (page, text, isActive = false) => {
            const button = document.createElement('button');
            button.className = `page-btn ${isActive ? 'active' : ''}`;
            button.textContent = text || page;
            button.addEventListener('click', () => {
                currentPage = page;
                renderPublications();
                // Scroll to top of publications section
                document.getElementById('publications').scrollIntoView({ behavior: 'smooth' });
            });
            paginationContainer.appendChild(button);
        };
        
        // Prev button
        if (currentPage > 1) {
            createPageButton(currentPage - 1, '<');
        }
        
        // Page buttons (smart range sizing)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            createPageButton(i, null, i === currentPage);
        }
        
        // Next button
        if (currentPage < totalPages) {
            createPageButton(currentPage + 1, '>');
        }
    };
    
    // Event listeners for search and filters
    const filterAndSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        const yearVal = yearFilter.value;
        const typeVal = typeFilter.value;
        
        filteredPublications = allPublications.filter(pub => {
            // Check Search query
            const matchesQuery = !query || 
                (pub.Title || '').toLowerCase().includes(query) ||
                (pub.Authors || '').toLowerCase().includes(query) ||
                (pub.Publication || '').toLowerCase().includes(query) ||
                (pub.Publisher || '').toLowerCase().includes(query);
                
            // Check Year filter
            const matchesYear = yearVal === 'all' || pub.Year === yearVal;
            
            // Check Type filter
            const pubType = getPublicationType(pub);
            const matchesType = typeVal === 'all' || pubType === typeVal;
            
            return matchesQuery && matchesYear && matchesType;
        });
        
        currentPage = 1; // Reset to page 1
        renderPublications();
        updateDonutChart();
    };
    
    searchInput.addEventListener('input', filterAndSearch);
    yearFilter.addEventListener('change', filterAndSearch);
    typeFilter.addEventListener('change', filterAndSearch);

    // Sort publications by year descending (Executed after all functions are initialized to prevent hoisting ReferenceError)
    allPublications = publicationsDb.sort((a, b) => {
        const yearA = parseInt(a.Year) || 0;
        const yearB = parseInt(b.Year) || 0;
        return yearB - yearA;
    });
    
    filteredPublications = [...allPublications];
    totalCountText.textContent = allPublications.length;
    
    // Populate Year Filter dropdown dynamically
    const years = [...new Set(allPublications.map(p => p.Year).filter(Boolean))].sort((a, b) => b - a);
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    // Initial render
    renderPublications();
    updateDonutChart();

    // ==========================================
    // CONTACT FORM INTERACTION
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show sending state
            formFeedback.className = 'form-feedback';
            formFeedback.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending message...';
            
            // Mock network call
            setTimeout(() => {
                formFeedback.className = 'form-feedback success';
                formFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you! Your message has been sent successfully.';
                contactForm.reset();
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                    formFeedback.innerHTML = '';
                }, 5000);
            }, 1200);
        });
    }


    // ==========================================
    // SCROLL REVEAL OBSERVER (ADDED)
    // ==========================================
    const revealSections = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target); // Reveal only once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters the viewport
    });
    
    revealSections.forEach(sec => {
        revealObserver.observe(sec);
    });

    // ==========================================
    // COUNT-UP ANIMATION FOR METRICS (ADDED)
    // ==========================================
    const counterElements = document.querySelectorAll('.counter-animate');
    
    const animateCounter = (el) => {
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
        const duration = 1500; // 1.5s animation duration
        let startTime = null;
        
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out quad formula
            const easedProgress = progress * (2 - progress);
            const currentVal = easedProgress * target;
            
            el.textContent = currentVal.toFixed(decimals) + suffix;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.textContent = target.toFixed(decimals) + suffix;
            }
        };
        
        window.requestAnimationFrame(step);
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        threshold: 0.2
    });
    
    counterElements.forEach(el => {
        counterObserver.observe(el);
    });


    // ==========================================
    // PDF MODAL VIEW ENGINE (ADDED)
    // ==========================================
    const pdfModal = document.getElementById('pdf-viewer-modal');
    const pdfIframe = document.getElementById('pdf-viewer-iframe');
    const pdfTitle = document.getElementById('pdf-viewer-title');
    const pdfClose = document.getElementById('pdf-viewer-close');
    
    // Intercept clicks on links pointing to PDF files
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href') || '';
        if (href.toLowerCase().endsWith('.pdf')) {
            // Check if mobile device
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (!isMobile) {
                e.preventDefault();
                // Get human readable title
                let title = link.getAttribute('data-title') || link.textContent.trim() || 'PDF Document';
                // Remove extra whitespace or icon characters
                title = title.replace(/\s+/g, ' ');
                
                pdfTitle.textContent = title;
                pdfIframe.src = href;
                pdfModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
    
    const closePdfModal = () => {
        if (pdfModal) {
            pdfModal.classList.remove('active');
            pdfIframe.src = ''; // Clear source to stop load
            document.body.style.overflow = '';
        }
    };
    
    if (pdfClose) pdfClose.addEventListener('click', closePdfModal);
    if (pdfModal) {
        pdfModal.addEventListener('click', (e) => {
            if (e.target === pdfModal) {
                closePdfModal();
            }
        });
    }


    // ==========================================
    // HERO BACKGROUND PARALLAX/ROLLOVER EFFECT (ADDED)
    // ==========================================
    const heroSection = document.getElementById('hero');
    const backgroundOrbs = document.querySelectorAll('.orb');
    
    if (heroSection && backgroundOrbs.length > 0) {
        heroSection.addEventListener('mousemove', (e) => {
            const { width, height } = heroSection.getBoundingClientRect();
            // Calculate distance from center (range: -0.5 to 0.5)
            const mouseX = (e.clientX / width) - 0.5;
            const mouseY = (e.clientY / height) - 0.5;
            
            backgroundOrbs.forEach((orb, index) => {
                // Different depth multipliers for parallax layering
                const depth = (index + 1) * 22;
                const moveX = mouseX * depth;
                const moveY = mouseY * depth;
                orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
        
        // Reset orb positions smoothly when mouse leaves hero bounds
        heroSection.addEventListener('mouseleave', () => {
            backgroundOrbs.forEach(orb => {
                orb.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
                orb.style.transform = 'translate(0, 0)';
            });
        });
        
        // Disable transitions on mouse enter to avoid drag lag
        heroSection.addEventListener('mouseenter', () => {
            backgroundOrbs.forEach(orb => {
                orb.style.transition = 'transform 0.1s ease-out';
            });
        });
    }

    // ==========================================
    // DYNAMIC FOOTER COPYRIGHT YEAR & IMAGE FALLBACKS
    // ==========================================
    const copyrightYearSpan = document.getElementById('copyright-year');
    if (copyrightYearSpan) {
        copyrightYearSpan.textContent = new Date().getFullYear();
    }

    // Global SVG image fallback handler for missing external image assets
    const svgFallback = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='%23111827'/%3E%3Cpath d='M130 80 L170 80 L170 120 L130 120 Z' stroke='%234285F4' stroke-width='3' fill='none'/%3E%3Ccircle cx='150' cy='100' r='10' fill='%234285F4'/%3E%3Ctext x='150' y='150' font-size='12' fill='%239ca3af' text-anchor='middle' font-family='sans-serif'%3EImage Preview Unavailable%3C/text%3E%3C/svg%3E";

    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
            if (!img.dataset.fallbackApplied) {
                img.dataset.fallbackApplied = 'true';
                img.src = svgFallback;
                img.style.objectFit = 'cover';
            }
        });
    });

});


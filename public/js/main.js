document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuTrigger = document.querySelector('.mobile-menu-trigger');
    const mainNavLinks = document.querySelector('.nav-links-main');
    if (mobileMenuTrigger) {
        mobileMenuTrigger.addEventListener('click', () => {
            mainNavLinks.classList.toggle('mobile-active');
        });
    }

    // User Dropdown Toggle
    const userMenuTrigger = document.querySelector('.user-menu-trigger');
    const userDropdown = document.querySelector('.user-dropdown');
    if (userMenuTrigger) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the window click from firing immediately
            userDropdown.classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        if (userDropdown && userDropdown.classList.contains('active') && !userMenuTrigger.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });


    // Card Swiping Logic
    const cardStack = document.getElementById('card-stack');
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');

    if (!cardStack) return; // Don't run on pages without the card stack

    let activeCard = cardStack.querySelector('.profile-card:last-child');
    let startX, startY, moveX, moveY;

    function initializeCard(card) {
        if (!card) return;

        card.addEventListener('mousedown', dragStart);
        card.addEventListener('touchstart', dragStart, { passive: true });
    }

    function dragStart(e) {
        if (!activeCard) return;
        startX = e.clientX || e.touches[0].clientX;
        activeCard.style.transition = 'none';

        document.addEventListener('mousemove', dragging);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', dragging, { passive: true });
        document.addEventListener('touchend', dragEnd);
    }

    function dragging(e) {
        if (!activeCard) return;
        moveX = e.clientX || e.touches[0].clientX;
        const diffX = moveX - startX;
        const rotate = diffX / 20; // Rotation effect

        activeCard.style.transform = `translateX(${diffX}px) rotate(${rotate}deg)`;
    }

    function dragEnd(e) {
        document.removeEventListener('mousemove', dragging);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragging);
        document.removeEventListener('touchend', dragEnd);

        if (!activeCard) return;

        const diffX = moveX - startX;
        if (Math.abs(diffX) > 100) { // Threshold for a swipe
            if (diffX > 0) {
                swipe('right');
            } else {
                swipe('left');
            }
        } else {
            // Reset card position
            activeCard.style.transition = 'transform 0.3s ease';
            activeCard.style.transform = '';
        }
        startX = 0;
        moveX = 0;
    }

    async function swipe(direction) {
        if (!activeCard) return;

        const userId = activeCard.dataset.id;
        const action = direction === 'right' ? 'like' : 'dislike';

        // Animate card out
        const endX = direction === 'right' ? window.innerWidth : -window.innerWidth;
        activeCard.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        activeCard.style.transform = `translateX(${endX}px) rotate(${direction === 'right' ? 30 : -30}deg)`;
        activeCard.style.opacity = '0';

        try {
            const response = await fetch(`/discover/${action}/${userId}`, { method: 'POST' });
            const data = await response.json();

            if (data.match) {
                // Show match notification
                showMatchModal(data.targetUser);
            }
        } catch (error) {
            console.error('Error processing action:', error);
        }

        setTimeout(removeTopCard, 500);
    }

    function removeTopCard() {
        if (activeCard) {
            activeCard.remove();
            activeCard = cardStack.querySelector('.profile-card:last-child');
            initializeCard(activeCard);

            if (!activeCard) {
                cardStack.innerHTML = `<div class="no-more-profiles">
                    <h2>You're All Caught Up!</h2>
                    <p>Check back later for new profiles.</p>
                </div>`;
                if(likeBtn) likeBtn.style.display = 'none';
                if(dislikeBtn) dislikeBtn.style.display = 'none';
            }
        }
    }

    // Button event listeners
    if(likeBtn) {
        likeBtn.addEventListener('click', () => swipe('right'));
    }
    if(dislikeBtn) {
        dislikeBtn.addEventListener('click', () => swipe('left'));
    }


    function showMatchModal(targetUser) {
        const modal = document.getElementById('match-modal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="match-modal-content">
                <h2>It's a Match!</h2>
                <p>You and ${targetUser.displayName} have liked each other.</p>
                <div class="match-avatars">
                    <img src="${currentUser.profileImage}" alt="Your photo">
                    <img src="${targetUser.profileImage}" alt="${targetUser.displayName}'s photo">
                </div>
                <button id="close-match-modal" class="btn">Keep Swiping</button>
                <a href="/chats/${targetUser._id}" class="btn-secondary">Send a Message</a>
            </div>
        `;
        modal.style.display = 'flex';

        document.getElementById('close-match-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Initialize the first card
    initializeCard(activeCard);
});
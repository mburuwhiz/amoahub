document.addEventListener('DOMContentLoaded', () => {
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetInputId = button.dataset.target;
            const passwordInput = document.getElementById(targetInputId);
            const eyeIcon = button.querySelector('.eye-icon');
            const eyeSlashIcon = button.querySelector('.eye-slash-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.classList.add('hidden');
                eyeSlashIcon.classList.remove('hidden');
            } else {
                passwordInput.type = 'password';
                eyeIcon.classList.remove('hidden');
                eyeSlashIcon.classList.add('hidden');
            }
        });
    });
});
// Fonction pour mettre à jour le header sur toutes les pages
function updateHeader() {
    // Récupérer la session
    const loginInfo = localStorage.getItem('dataLogin');
    
    // Trouver le lien "Login" dans le header
    const loginLink = document.querySelector('a[href="login.html"]');
    
    // Si le lien n'existe pas, on est peut-être sur une autre page
    if (!loginLink) return;
    
    if (loginInfo) {
        const dataLogin = JSON.parse(loginInfo);
        
        // Si l'utilisateur est connecté
        if (dataLogin.isLoggedIn === true) {
            // Afficher l'email à la place de "Login"
            loginLink.textContent = dataLogin.userEmail;
            loginLink.style.color = '#06b6d4'; // Couleur cyan
            loginLink.style.cursor = 'default';
            loginLink.href = '#'; // Désactiver le lien
            
            // Vérifier si le bouton Logout existe déjà
            let logoutBtn = document.getElementById('logout-btn-header');
            
            if (!logoutBtn) {
                // Créer le bouton "Logout"
                logoutBtn = document.createElement('a');
                logoutBtn.id = 'logout-btn-header';
                logoutBtn.href = '#';
                logoutBtn.className = 'nav-link hover:text-red-500 transition-colors';
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-1"></i> Logout';
                logoutBtn.style.color = '#ef4444'; // Rouge
                
                // Ajouter le bouton après l'email
                loginLink.parentNode.insertBefore(logoutBtn, loginLink.nextSibling);
                
                // Gérer le clic sur Logout
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        }
    }
}

// Fonction de déconnexion
function logout() {
    // Supprimer la session du localStorage
    localStorage.removeItem('dataLogin');
    
    // Message de confirmation
    alert('You have been logged out successfully!');
    
    // Recharger la page pour mettre à jour l'UI
    window.location.reload();
}

// Appeler updateHeader au chargement de TOUTES les pages
document.addEventListener('DOMContentLoaded', function() {
    updateHeader();
});
console.log("✅ login.js is loaded on", window.location.pathname);


// Base de données 
const users = [
    {email: "nourtajat@gmail.com", password: "Azert--123"},
    {email: "youcode@gmail.com", password: "Youcode--123"},
    {email: "gryffindorelit@gmail.com", password: "griff--123"}
];
// Validation de formulaire
const form = document.getElementById("form_login");
const email = document.getElementById("email");
const password = document.getElementById("password");
const msgErrEmail = document.querySelector(".msg_err_email");
const msgErrPassword = document.querySelector(".msg_err_password");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$%#*&\-]).{8,}$/;
const emailRegex = /^\w+@[a-z]+\.[a-z]{2,}$/;
const submitBtn = form.querySelector(".btn_submit");
const loginErro = document.querySelector(".login_err");
// Check connection session
function checkLogin() {
    const loginInfo = localStorage.getItem('dataLogin');
    
    // Si une session existe
    if (loginInfo) {
        const dataLogin = JSON.parse(loginInfo);
        if (dataLogin.isLoggedIn === true) {
            console.log("User already logged in:", dataLogin.userEmail);
        }
    }
}


// Appeler la fonction au chargement de la page
checkLogin();

function checkUsers(emailValue, passwordValue){
    return users.find(user=> user.email===emailValue && user.password===passwordValue);
}

function setValid(input){
    input.classList.add('valid');
    input.classList.remove('invalid');
}

function setInvalid(input) {
    input.classList.add('invalid');
    input.classList.remove('valid');
}

function validInput(input, regex, msgErro){
    if(input.value.trim()===""){
        msgErro.textContent = 'This field is required';
        msgErro.style.color='red';
        setInvalid(input);
        return false;
    } else if (!regex.test(input.value)) {
        msgErro.textContent='Invalid inputs';
        msgErro.style.color='red';
        setInvalid(input);
        return false;
    } else {
        msgErro.textContent='';
        msgErro.style.color='green';
        setValid(input);
        return true;
    }
}

email.addEventListener('input', ()=> validInput(email, emailRegex, msgErrEmail));
password.addEventListener('input', ()=> validInput(password, passwordRegex, msgErrPassword));

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const validEmail = validInput(email, emailRegex, msgErrEmail);
    const validPassword = validInput(password, passwordRegex, msgErrPassword);
    
    if(validEmail && validPassword){
        const user = checkUsers(email.value, password.value);
        if(user){
            const stockageData = {
                isLoggedIn: true,           
                userEmail: email.value
            };
            localStorage.setItem('dataLogin', JSON.stringify(stockageData));
            alert('Login successful!');
            submitBtn.classList.remove('btn-primary');
            submitBtn.classList.add('disable_btn');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            loginErro.textContent='Incorrect email or password';
            loginErro.style.color='red';
            setInvalid(email);
            setInvalid(password);
            form.reset();  // Reset uniquement ici
            email.classList.remove('valid', 'invalid');
            password.classList.remove('valid', 'invalid');
        }
    } else {
        form.reset();  // Reset si validation échoue
    }
    
});


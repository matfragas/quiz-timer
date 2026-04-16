class QuizTimer {
    constructor() {
        // Configuration
        this.TOTAL_QUESTIONS = 80;
        this.TOTAL_TIME = 60 * 60; // 60 minutes en secondes
        this.IDEAL_TIME_PER_QUESTION = this.TOTAL_TIME / this.TOTAL_QUESTIONS; // 45 secondes

        // État
        this.timeRemaining = this.TOTAL_TIME;
        this.timeCurrentQuestion = this.IDEAL_TIME_PER_QUESTION;
        this.currentQuestion = 1;
        this.isRunning = false;
        this.timerInterval = null;

        // Éléments DOM
        this.timeGlobalDisplay = document.getElementById('timeGlobal');
        this.questionDisplay = document.getElementById('questionDisplay');
        this.currentNumDisplay = document.getElementById('currentNum');
        this.questionTimeDisplay = document.getElementById('questionTime');
        this.timerFill = document.getElementById('timerFill');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.nextQuestionBtn = document.getElementById('nextQuestionBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.warningBox = document.getElementById('warningBox');
        this.warningText = document.getElementById('warningText');

        // Setup
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.updateDisplay();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.nextQuestionBtn.addEventListener('click', () => this.nextQuestion());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.nextQuestionBtn.disabled = false;

        this.timerInterval = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.timeCurrentQuestion--;

                // Réinitialiser le timer de la question si négatif
                if (this.timeCurrentQuestion <= 0) {
                    this.timeCurrentQuestion = this.IDEAL_TIME_PER_QUESTION;
                }

                this.updateDisplay();
                this.saveToLocalStorage();
            } else {
                this.end();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    nextQuestion() {
        if (this.currentQuestion < this.TOTAL_QUESTIONS) {
            this.currentQuestion++;
            this.timeCurrentQuestion = this.IDEAL_TIME_PER_QUESTION;
            this.warningBox.classList.add('hidden');
            this.updateDisplay();
            this.saveToLocalStorage();
        }
    }

    reset() {
        this.pause();
        this.timeRemaining = this.TOTAL_TIME;
        this.currentQuestion = 1;
        this.timeCurrentQuestion = this.IDEAL_TIME_PER_QUESTION;
        this.warningBox.classList.add('hidden');
        this.updateDisplay();
        localStorage.removeItem('quizTimer');
    }

    end() {
        this.pause();
        this.warningBox.classList.remove('hidden');
        this.warningBox.classList.add('red-alert');
        this.warningText.textContent = '⏰ Temps écoulé! Quiz terminé.';
        alert('Temps écoulé! Votre quiz est terminé.');
    }

    updateDisplay() {
        // Mise à jour du timer global
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeGlobalDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Mise à jour de la question actuelle
        this.questionDisplay.textContent = this.currentQuestion;
        this.currentNumDisplay.textContent = this.currentQuestion;

        // Mise à jour du timer de la question actuelle
        this.updateQuestionTimer();

        // Vérification des alertes
        this.checkWarnings();
    }

    updateQuestionTimer() {
        this.questionTimeDisplay.textContent = Math.ceil(this.timeCurrentQuestion);

        // Calcul du pourcentage de temps utilisé
        const percentageUsed = 1 - (this.timeCurrentQuestion / this.IDEAL_TIME_PER_QUESTION);
        const circumference = 565.48; // 2 * π * 90 (rayon du cercle)
        const offset = circumference * percentageUsed;

        this.timerFill.style.strokeDashoffset = offset;

        // Changement de couleur
        this.timerFill.classList.remove('orange', 'red');
        
        if (percentageUsed >= 0.9) { // Plus de 90% du temps utilisé (Rouge)
            this.timerFill.classList.add('red');
        } else if (percentageUsed >= 0.8) { // Plus de 80% du temps utilisé (Orange)
            this.timerFill.classList.add('orange');
        }
    }

    checkWarnings() {
        const timeSpent = this.TOTAL_TIME - this.timeRemaining;
        const expectedQuestions = Math.round(timeSpent / this.IDEAL_TIME_PER_QUESTION);
        const difference = this.currentQuestion - expectedQuestions;

        if (difference < -2) {
            this.warningBox.classList.remove('hidden', 'red-alert');
            this.warningText.textContent = `⚠️ Vous êtes en retard de ${Math.abs(difference)} questions`;
        } else if (difference > 2) {
            this.warningBox.classList.remove('hidden', 'red-alert');
            this.warningText.textContent = `✓ Vous êtes en avance de ${difference} questions`;
        } else {
            this.warningBox.classList.add('hidden');
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('quizTimer', JSON.stringify({
            timeRemaining: this.timeRemaining,
            currentQuestion: this.currentQuestion,
            timeCurrentQuestion: this.timeCurrentQuestion,
            timestamp: Date.now()
        }));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('quizTimer');
        if (saved) {
            const data = JSON.parse(saved);
            const elapsed = (Date.now() - data.timestamp) / 1000;
            this.timeRemaining = Math.max(0, data.timeRemaining - Math.floor(elapsed));
            this.currentQuestion = data.currentQuestion;
            this.timeCurrentQuestion = Math.max(0, data.timeCurrentQuestion - Math.floor(elapsed));
        }
    }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    new QuizTimer();
});

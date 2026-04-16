class QuizTimer {
    constructor() {
        // Configuration
        this.TOTAL_QUESTIONS = 80;
        this.TOTAL_TIME = 60 * 60; // 60 minutes en secondes
        this.IDEAL_TIME_PER_QUESTION = this.TOTAL_TIME / this.TOTAL_QUESTIONS; // ~45 secondes

        // État
        this.timeRemaining = this.TOTAL_TIME;
        this.currentQuestion = 0;
        this.isRunning = false;
        this.timerInterval = null;

        // Éléments DOM
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.currentQuestionInput = document.getElementById('currentQuestion');
        this.progressFill = document.getElementById('questionProgress');
        this.progressPercent = document.getElementById('progressPercent');
        this.timePerQuestionDisplay = document.getElementById('timePerQuestion');
        this.questionsPerMinDisplay = document.getElementById('questionsPerMin');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.warningBox = document.getElementById('warningBox');
        this.warningText = document.getElementById('warningText');
        this.notesArea = document.getElementById('notesArea');
        this.saveNotesBtn = document.getElementById('saveNotesBtn');
        this.progressRing = document.querySelector('.progress-ring-circle');

        // Event listeners
        this.setupEventListeners();

        // Charger les données sauvegardées
        this.loadFromLocalStorage();

        // Initialiser l'affichage
        this.updateDisplay();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.currentQuestionInput.addEventListener('change', () => {
            this.currentQuestion = parseInt(this.currentQuestionInput.value) || 0;
            this.updateDisplay();
            this.saveToLocalStorage();
        });
        this.saveNotesBtn.addEventListener('click', () => this.saveNotes());
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        this.timerInterval = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
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

    reset() {
        this.pause();
        this.timeRemaining = this.TOTAL_TIME;
        this.currentQuestion = 0;
        this.currentQuestionInput.value = 0;
        this.updateDisplay();
        this.saveToLocalStorage();
    }

    end() {
        this.pause();
        this.warningBox.classList.remove('hidden');
        this.warningText.textContent = '⏰ Temps écoulé! Quiz terminé.';
        alert('Temps écoulé! Votre quiz est terminé.');
    }

    updateDisplay() {
        // Mise à jour du timer
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.minutesDisplay.textContent = String(minutes).padStart(2, '0');
        this.secondsDisplay.textContent = String(seconds).padStart(2, '0');

        // Mise à jour de la barre de progression
        const progressPercent = (this.currentQuestion / this.TOTAL_QUESTIONS) * 100;
        this.progressFill.style.width = progressPercent + '%';
        this.progressPercent.textContent = Math.round(progressPercent);

        // Mise à jour du cercle de progression temporelle
        this.updateProgressRing();

        // Calcul des statistiques
        this.updateStats();

        // Vérification du rythme
        this.checkPace();
    }

    updateProgressRing() {
        const radius = this.progressRing.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const progress = this.timeRemaining / this.TOTAL_TIME;
        const offset = circumference - (progress * circumference);

        this.progressRing.style.strokeDashoffset = offset;

        // Changement de couleur en fonction du temps restant
        if (this.timeRemaining < 300) { // Moins de 5 minutes
            this.progressRing.style.stroke = '#f44336';
        } else if (this.timeRemaining < 600) { // Moins de 10 minutes
            this.progressRing.style.stroke = '#ff9800';
        } else {
            this.progressRing.style.stroke = 'url(#gradient)';
        }
    }

    updateStats() {
        // Temps moyen par question répondue
        if (this.currentQuestion > 0) {
            const timeSpent = this.TOTAL_TIME - this.timeRemaining;
            const avgTimePerQuestion = Math.round(timeSpent / this.currentQuestion);
            const minutes = Math.floor(avgTimePerQuestion / 60);
            const seconds = avgTimePerQuestion % 60;
            this.timePerQuestionDisplay.textContent = `${minutes}m${seconds}s`;

            // Questions par minute
            const minutesSpent = timeSpent / 60;
            const qpm = (this.currentQuestion / minutesSpent).toFixed(1);
            this.questionsPerMinDisplay.textContent = qpm;
        } else {
            this.timePerQuestionDisplay.textContent = '45s';
            this.questionsPerMinDisplay.textContent = '1.3';
        }
    }

    checkPace() {
        const timeSpent = this.TOTAL_TIME - this.timeRemaining;
        const expectedQuestions = Math.round(timeSpent / this.IDEAL_TIME_PER_QUESTION);
        const difference = this.currentQuestion - expectedQuestions;

        if (difference < -3) {
            this.warningBox.classList.remove('hidden');
            this.warningText.textContent = `⚠️ Vous êtes en retard de ${Math.abs(difference)} questions`;
        } else if (difference > 3) {
            this.warningBox.classList.remove('hidden');
            this.warningText.textContent = `✓ Vous êtes en avance de ${difference} questions`;
        } else {
            this.warningBox.classList.add('hidden');
        }
    }

    saveNotes() {
        const notes = this.notesArea.value;
        localStorage.setItem('quizNotes', notes);
        alert('Notes sauvegardées!');
    }

    saveToLocalStorage() {
        localStorage.setItem('quizTimer', JSON.stringify({
            timeRemaining: this.timeRemaining,
            currentQuestion: this.currentQuestion,
            timestamp: Date.now()
        }));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('quizTimer');
        const savedNotes = localStorage.getItem('quizNotes');

        if (saved) {
            const data = JSON.parse(saved);
            const elapsed = (Date.now() - data.timestamp) / 1000;
            this.timeRemaining = Math.max(0, data.timeRemaining - Math.floor(elapsed));
            this.currentQuestion = data.currentQuestion;
            this.currentQuestionInput.value = this.currentQuestion;
        }

        if (savedNotes) {
            this.notesArea.value = savedNotes;
        }
    }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    new QuizTimer();
});
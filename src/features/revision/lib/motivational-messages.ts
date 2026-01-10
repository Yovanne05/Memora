export function getMotivationalMessage(accuracy: number): string {
  if (accuracy >= 90) {
    return 'Excellent ! Vous maîtrisez parfaitement ce contenu ! 🌟'
  } else if (accuracy >= 75) {
    return 'Très bon travail ! Continuez sur cette lancée ! 💪'
  } else if (accuracy >= 60) {
    return 'Bon effort ! Vous progressez bien ! 📚'
  } else {
    return 'Continuez à pratiquer ! Chaque révision vous aide à progresser ! 🎯'
  }
}

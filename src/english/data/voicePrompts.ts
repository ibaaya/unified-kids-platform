/** Spoken feedback shared by Learn English and the Voice Studio inventory. */
export const ENGLISH_ENCOURAGEMENTS = [
  'Excellent!',
  'Well done!',
  'Amazing!',
  'Perfect!',
  'Super job!',
  'Brilliant!',
  'Fantastic!',
  'Keep going!',
  'You are a star!',
  'Wonderful!',
] as const

export const ENGLISH_FIXED_GAME_SPEECH = [
  { id: 'retry', text: 'Try again!' },
  { id: 'quiz-correct', text: 'Correct! Well done!' },
  { id: 'sentence-correct', text: 'Excellent! Well done!' },
  { id: 'letter-great-job', text: 'Great job!' },
  { id: 'letter-complete', text: 'Great job! Section complete!' },
  { id: 'picture-question', text: 'What is this picture?' },
  { id: 'missing-letter-question', text: 'Complete the missing letter in the word' },
  { id: 'spelling-question', text: 'Which is the correct spelling?' },
  { id: 'listen-sentence', text: 'Listen to the sentence.' },
  { id: 'listen-again', text: 'Listen again.' },
  { id: 'wait-repeat', text: 'Wait for the audio, then repeat.' },
] as const

/** Voice prompts are shared with quizEngine so studio items never drift from play. */
export const ENGLISH_LETTER_QUESTION_VOICE = {
  start: (name: string) => `Which word starts with the letter ${name}?`,
  middle: (name: string) => `Which word has the letter ${name} in the middle?`,
  end: (name: string) => `Which word ends with the letter ${name}?`,
  contains: (name: string) => `Which word has the letter ${name} in it?`,
  whereIs: (name: string, word: string) => `Where is the letter ${name} in the word ${word}?`,
} as const

export const ENGLISH_FINAL_QUESTION_VOICE = {
  picture: () => 'What is this picture?',
  findPicture: (word: string) => `Find the picture of ${word}`,
  firstLetter: (word: string) => `What is the first letter of the word ${word}?`,
  lastLetter: (word: string) => `What is the last letter of the word ${word}?`,
  missingLetter: () => 'Complete the missing letter in the word',
  spelling: () => 'Which is the correct spelling?',
  countLetter: (letter: string, word: string) => `How many times does the letter ${letter} appear in the word ${word}?`,
} as const

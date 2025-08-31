// MVP Questions - 4 compelling questions max
import type { Question } from '../types/types';

export const QUESTIONNAIRE_QUESTIONS: Question[] = [
  {
    id: 'health-confusion',
    title: 'When you get bloodwork results, how do you usually feel?',
    subtitle: 'Be honest - there\'s no wrong answer',
    type: 'multiple-choice',
    required: true,
    options: [
      {
        id: 'confused',
        text: '😕 Confused by all the numbers',
        value: 'confused'
      },
      {
        id: 'worried',
        text: '😰 Worried about what they mean',
        value: 'worried'
      },
      {
        id: 'curious',
        text: '🤔 Curious but need help understanding',
        value: 'curious'
      },
      {
        id: 'confident',
        text: '😊 Pretty confident I understand',
        value: 'confident'
      }
    ]
  },
  {
    id: 'current-behavior',
    title: 'What do you typically do with your lab results?',
    subtitle: 'Most people do one of these',
    type: 'multiple-choice',
    required: true,
    options: [
      {
        id: 'google',
        text: '🔍 Google medical terms frantically',
        value: 'google'
      },
      {
        id: 'ask-others',
        text: '👥 Ask friends or family what they think',
        value: 'ask-others'
      },
      {
        id: 'wait-doctor',
        text: '⏰ Wait for my doctor to explain everything',
        value: 'wait-doctor'
      },
      {
        id: 'file-away',
        text: '📁 File them away and hope for the best',
        value: 'file-away'
      }
    ]
  },
  {
    id: 'understanding-importance',
    title: 'How important is it for you to understand your health data?',
    subtitle: 'On a scale of 1-5',
    type: 'scale',
    required: true,
    options: [
      { id: '1', text: '1 - Not important', value: '1' },
      { id: '2', text: '2 - Slightly important', value: '2' },
      { id: '3', text: '3 - Moderately important', value: '3' },
      { id: '4', text: '4 - Very important', value: '4' },
      { id: '5', text: '5 - Extremely important', value: '5' }
    ]
  },
  {
    id: 'desired-outcome',
    title: 'What would change if you could instantly understand your bloodwork?',
    subtitle: 'Choose what resonates most with you',
    type: 'multiple-choice',
    required: true,
    options: [
      {
        id: 'control',
        text: '💪 Feel more in control of my health',
        value: 'control'
      },
      {
        id: 'decisions',
        text: '🎯 Make better health decisions',
        value: 'decisions'
      },
      {
        id: 'anxiety',
        text: '😌 Reduce anxiety about results',
        value: 'anxiety'
      },
      {
        id: 'questions',
        text: '❓ Ask my doctor better questions',
        value: 'questions'
      }
    ]
  }
];

export const TOTAL_QUESTIONS = QUESTIONNAIRE_QUESTIONS.length;

// Avatar evolution rules - simple mapping
export const getAvatarStageForStep = (step: number): 'confused' | 'curious' | 'confident' => {
  if (step <= 1) return 'confused';
  if (step <= 2) return 'curious';
  return 'confident';
};

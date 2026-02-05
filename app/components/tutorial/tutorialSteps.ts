export interface TutorialStep {
  nativeID: string; // nativeID of the element to highlight
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right'; // Position of the tooltip relative to the target
  allowInteraction?: boolean; // If true, allows interaction with the highlighted element
}

export interface ScreenTutorial {
  [screenName: string]: TutorialStep[];
}

export const tutorials: ScreenTutorial = {
  homepage: [
    {
      nativeID: 'account-card',
      title: 'Account Details',
      content: 'This section shows your account balance and card information. Tap on it to see more details and transaction history.',
      position: 'bottom', // Example position
      allowInteraction: true, // Example: allow tapping the card
    },
    // Add more steps for the homepage here
  ],
  // Add tutorials for other screens here
};
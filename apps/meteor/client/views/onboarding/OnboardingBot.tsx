import React, { useState } from 'react';
import { Box, Button, ProgressBar } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';
import { useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import { WelcomeStep, ProfileStep, ChannelsStep, TeamStep, SettingsStep, CompleteStep } from './steps';

interface OnboardingStep {
	id: string;
	component: React.FC;
	completed: boolean;
}

export const OnboardingBot: React.FC = () => {
	const { t } = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();
	const [currentStep, setCurrentStep] = useState(0);

	const [steps, setSteps] = useState<OnboardingStep[]>([
		{ id: 'welcome', component: WelcomeStep, completed: false },
		{ id: 'profile', component: ProfileStep, completed: false },
		{ id: 'channels', component: ChannelsStep, completed: false },
		{ id: 'team', component: TeamStep, completed: false },
		{ id: 'settings', component: SettingsStep, completed: false },
		{ id: 'complete', component: CompleteStep, completed: false },
	]);

	const progress = (steps.filter((s) => s.completed).length / steps.length) * 100;
	const CurrentStepComponent = steps[currentStep].component;

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			const updatedSteps = [...steps];
			updatedSteps[currentStep].completed = true;
			setSteps(updatedSteps);
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSkip = () => {
		dispatchToastMessage({ type: 'info', message: t('You can access this guide anytime from the help menu.') });
	};

	const handleComplete = () => {
		const updatedSteps = [...steps];
		updatedSteps[currentStep].completed = true;
		setSteps(updatedSteps);
		dispatchToastMessage({ type: 'success', message: t('Onboarding completed successfully!') });
	};

	return (
		<Box
			display='flex'
			flexDirection='column'
			height='100%'
			width='100%'
			maxWidth='800px'
			margin='auto'
			padding='x24'
		>
			<Box marginBlockEnd='x24'>
				<Box fontSize='h1' fontWeight='bold' marginBlockEnd='x8'>
					{t('Onboarding Guide')}
				</Box>
				<ProgressBar percentage={progress} />
				<Box fontSize='p2' color='hint' marginBlockStart='x8'>
					{t('Step {{current}} of {{total}}', { current: currentStep + 1, total: steps.length })}
				</Box>
			</Box>

			<Box
				flexGrow={1}
				display='flex'
				flexDirection='column'
				justifyContent='center'
				backgroundColor='surface'
				borderRadius='x4'
				elevation='1'
				overflow='auto'
			>
				<CurrentStepComponent />
			</Box>

			<Box marginBlockStart='x24' display='flex' justifyContent='space-between' alignItems='center'>
				<Button onClick={handleSkip} secondary>
					{t('Skip Tour')}
				</Button>
				<Box display='flex' gap='x8'>
					<Button onClick={handlePrevious} disabled={currentStep === 0}>
						{t('Previous')}
					</Button>
					{currentStep === steps.length - 1 ? (
						<Button onClick={handleComplete} primary>
							{t('Complete')}
						</Button>
					) : (
						<Button onClick={handleNext} primary>
							{t('Next')}
						</Button>
					)}
				</Box>
			</Box>

			<Box marginBlockStart='x16'>
				<Box display='flex' justifyContent='center' gap='x8'>
					{steps.map((step, index) => (
						<Box
							key={step.id}
							width='x12'
							height='x12'
							borderRadius='full'
							backgroundColor={
								step.completed ? 'success' : index === currentStep ? 'primary' : 'neutral-300'
							}
							style={{ cursor: 'pointer' }}
							onClick={() => setCurrentStep(index)}
						/>
					))}
				</Box>
			</Box>
		</Box>
	);
};

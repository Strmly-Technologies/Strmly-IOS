import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useUploadFlow } from './hooks/useUploadFlow';
import FileSelectScreen from './screens/FileSelectScreen';
import FormatSelectScreen from './screens/FormatSelectScreen';
import VideoDetailScreen from './screens/VideoDetailScreen';
import FinalStageScreen from './screens/FinalStageScreen';
import UploadProgressScreen from './screens/UploadProgressScreen';
import EpisodeSelectionScreen from './screens/EpisodeSelectionScreen';
import { SeriesSelectionScreen } from '../studio/screens';
import SimpleSeriesCreationScreen from '../studio/screens/SimpleSeriesCreationScreen';
import { Series } from '../studio/types';

interface VideoUploadFlowProps {
  onComplete: () => void;
  onCancel: () => void;
  draftData?: any; // Optional draft data to initialize from
}

/**
 * Main Video Upload Flow Component
 * Orchestrates the entire upload process through multiple screens
 * 
 * Backend Integration Notes:
 * - This component manages the flow state and coordinates API calls
 * - Replace mock implementations with real API integrations
 * - Add proper error boundaries and loading states
 * - Consider implementing offline support for draft saving
 * 
 * Usage:
 * <VideoUploadFlow 
 *   onComplete={() => navigateToStudio()} 
 *   onCancel={() => navigateBack()} 
 * />
 */
const VideoUploadFlow: React.FC<VideoUploadFlowProps> = ({
  onComplete,
  onCancel,
  draftData
}) => {
  const {
    state,
    goToNextStep,
    goToPreviousStep,
    goToDetailsStep,
    updateVideoDetails,
    updateFinalStageData,
    setSelectedFile,
    setVideoFormat,
    setSelectedSeries,
    validateCurrentStep,
    submitUpload,
    resetFlow,
    initializeFromDraft,
    saveToDraft,
  } = useUploadFlow();

  // Initialize from draft data if provided
  useEffect(() => {
    if (draftData) {
      initializeFromDraft(draftData);
    }
  }, [draftData, initializeFromDraft]);

  // Handle upload completion from progress screen
  const handleUploadComplete = () => {
    resetFlow();
    onComplete();
  };

  // Handle back navigation
  const handleBack = () => {
    if (state.currentStep === 'format-select' && !state.isEditingDraft) {
      // If user goes back from first screen (and not editing draft), cancel the flow
      onCancel();
    } else if (state.currentStep === 'format-select' && state.isEditingDraft) {
      // If editing draft and on format select, go back to studio
      onCancel();
    } else if (state.currentStep === 'file-select' && state.isEditingDraft) {
      // When editing draft and on file-select, allow going back to previous steps
      goToPreviousStep();
    } else if (state.currentStep === 'file-select' && !state.isEditingDraft) {
      // When creating new video and on file-select (last step), go back to final
      goToPreviousStep();
    } else {
      // For all other cases, allow normal navigation
      goToPreviousStep();
    }
  };

  // Handle file selection
  const handleFileSelected = (file: any) => {
    setSelectedFile(file);
    // Don't automatically go to next step - let user choose to upload or save draft
  };

  // Handle save to draft from file selection screen
  const handleSaveToDraftFromFileSelect = async () => {
    try {
      console.log('💾 Save to Draft button pressed');
      console.log('Current state:', {
        currentStep: state.currentStep,
        videoDetails: state.videoDetails,
        finalStageData: state.finalStageData,
        draftId: state.draftId
      });
      
      await saveToDraft();
      console.log('✅ Draft saved successfully, navigating back to studio');
      
      // Navigate back to studio/drafts after saving
      onComplete();
    } catch (error) {
      console.error('❌ Failed to save draft:', error);
      Alert.alert(
        'Save Failed',
        `Failed to save draft. ${error instanceof Error ? error.message : 'Please try again.'}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Handle continue upload from file selection screen
  const handleContinueUpload = async () => {
    await submitUpload();
  };

  // Handle format selection
  const handleFormatSelected = (format: 'episode' | 'single') => {
    setVideoFormat(format);
    if (format === 'episode') {
      // Go to series selection for episodes
      goToNextStep(); // This will go to 'series-selection'
    } else {
      // Skip series selection for single videos and go directly to details
      goToNextStep(); // This will go to 'details-1'
    }
  };

  // Handle continue from video details
  const handleContinue = () => {
    if (validateCurrentStep()) {
      goToNextStep();
    }
  };

  // Handle series selection
  const handleSeriesSelected = (series: Series) => {
    setSelectedSeries(series);
    // Skip series creation and go directly to details
    goToDetailsStep();
  };

  // Handle add new series from series selection
  const handleAddNewSeries = () => {
    goToNextStep(); // Go to series-creation
  };

  // Handle series creation completion
  const handleSeriesCreated = (series: Series) => {
    setSelectedSeries(series);
    // After creating series, go to details
    goToDetailsStep();
  };



  // Handle final upload submission - navigate to file selection
  const handleFinalUpload = () => {
    // Don't call submitUpload here - just navigate to file selection
    goToNextStep(); // This will go to file-select
  };

  // No need for auto-start effect since submitUpload handles it directly

  // Render current screen based on flow state
  const renderCurrentScreen = () => {
    switch (state.currentStep) {
      case 'file-select':
        return (
          <FileSelectScreen
            onFileSelected={handleFileSelected}
            onBack={handleBack}
            onSaveToDraft={handleSaveToDraftFromFileSelect}
            onContinueUpload={handleContinueUpload}
          />
        );

      case 'format-select':
        return (
          <FormatSelectScreen
            onFormatSelected={handleFormatSelected}
            onBack={handleBack}
          />
        );

      case 'episode-selection':
        return (
          <EpisodeSelectionScreen
            onBack={handleBack}
            onSeriesSelected={handleSeriesSelected}
            onAddNewSeries={handleAddNewSeries}
            selectedSeries={state.selectedSeries}
          />
        );

      case 'series-selection':
        return (
          <SeriesSelectionScreen
            onBack={handleBack}
            onSeriesSelected={handleSeriesSelected}
            onAddNewSeries={handleAddNewSeries}
          />
        );

      case 'series-creation':
        return (
          <SimpleSeriesCreationScreen
            onBack={handleBack}
            onSeriesCreated={handleSeriesCreated}
          />
        );

      case 'details-1':
        return (
          <VideoDetailScreen
            step={1}
            formData={state.videoDetails}
            onFormChange={updateVideoDetails}
            onContinue={handleContinue}
            onBack={handleBack}
            selectedSeries={state.selectedSeries}
            videoFormat={state.videoFormat}
            isEditingDraft={state.isEditingDraft}
          />
        );

      case 'details-2':
        return (
          <VideoDetailScreen
            step={2}
            formData={state.videoDetails}
            onFormChange={updateVideoDetails}
            onContinue={handleContinue}
            onBack={handleBack}
            selectedSeries={state.selectedSeries}
            videoFormat={state.videoFormat}
            isEditingDraft={state.isEditingDraft}
          />
        );

      case 'details-3':
        return (
          <VideoDetailScreen
            step={3}
            formData={state.videoDetails}
            onFormChange={updateVideoDetails}
            onContinue={handleContinue}
            onBack={handleBack}
            selectedSeries={state.selectedSeries}
            videoFormat={state.videoFormat}
            isEditingDraft={state.isEditingDraft}
          />
        );

      case 'final':
        return (
          <FinalStageScreen
            formData={state.finalStageData}
            videoDetails={state.videoDetails}
            onFormChange={updateFinalStageData}
            onUpload={handleFinalUpload}
            onBack={handleBack}
            selectedSeries={state.selectedSeries}
            videoFormat={state.videoFormat}
            isEditingDraft={state.isEditingDraft}
          />
        );

      case 'progress':
        return (
          <UploadProgressScreen
            progress={state.uploadProgress}
            onUploadComplete={handleUploadComplete}
          />
        );

      default:
        return null;
    }
  };

  return renderCurrentScreen();
};

export default VideoUploadFlow;
import { useState } from 'react';
import { getMaterialPreviewData } from '../utils/materials';

const INITIAL_PREVIEW_STATE = {
  activePreviewId: null,
  error: null,
  isOpen: false,
  material: null,
  previewKind: 'unsupported',
  previewUrl: '',
};

export const useMaterialPreview = ({ viewerRole = 'student' } = {}) => {
  const [previewState, setPreviewState] = useState(INITIAL_PREVIEW_STATE);

  const openPreview = async (material) => {
    if (!material) {
      return;
    }

    setPreviewState((currentState) => ({
      ...currentState,
      activePreviewId: material.id,
      error: null,
    }));

    try {
      const previewData = await getMaterialPreviewData(material, { viewerRole });

      setPreviewState({
        activePreviewId: null,
        error: null,
        isOpen: true,
        material,
        previewKind: previewData.previewKind,
        previewUrl: previewData.url,
      });
    } catch (error) {
      setPreviewState((currentState) => ({
        ...currentState,
        activePreviewId: null,
        error: error.message || 'Unable to preview this file right now.',
      }));

      throw error;
    }
  };

  const closePreview = () => {
    setPreviewState((currentState) => ({
      ...currentState,
      error: null,
      isOpen: false,
      material: null,
      previewKind: 'unsupported',
      previewUrl: '',
    }));
  };

  const clearPreviewError = () => {
    setPreviewState((currentState) =>
      currentState.error ? { ...currentState, error: null } : currentState,
    );
  };

  return {
    ...previewState,
    clearPreviewError,
    closePreview,
    openPreview,
  };
};

export default useMaterialPreview;

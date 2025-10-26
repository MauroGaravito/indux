import { create } from 'zustand'

export const useWizardStore = create((set) => ({
  projectId: '',
  personal: {},
  uploads: [],
  quiz: { total: 0, correct: 0 },
  signature: null,
  setProjectId: (projectId) => set({ projectId }),
  setPersonal: (personal) => set({ personal }),
  setUploads: (uploads) => set({ uploads }),
  setQuiz: (quiz) => set({ quiz }),
  setSignature: (signature) => set({ signature })
}))


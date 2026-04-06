import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
}

interface Candidate {
  _id: string;
  name: string;
  matchScore: number;
  scoreBreakdown: ScoreBreakdown;
  rationale: string;
  status: 'pending' | 'accepted' | 'rejected';
  experienceLevel: string;
  skills: string[];
}

interface CandidateState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  filters: {
    scoreThreshold: number;
    skillFilter: string;
    experienceFilter: string;
  };
}

const initialState: CandidateState = {
  candidates: [],
  loading: false,
  error: null,
  filters: {
    scoreThreshold: 0,
    skillFilter: '',
    experienceFilter: 'all',
  },
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    setCandidates: (state, action: PayloadAction<Candidate[]>) => {
      state.candidates = action.payload;
    },
    updateCandidateStatus: (state, action: PayloadAction<{ id: string; status: Candidate['status'] }>) => {
      const candidate = state.candidates.find((c) => c._id === action.payload.id);
      if (candidate) {
        candidate.status = action.payload.status;
      }
    },
    setFilters: (state, action: PayloadAction<Partial<CandidateState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCandidates, updateCandidateStatus, setFilters, setLoading, setError } = candidateSlice.actions;
export default candidateSlice.reducer;

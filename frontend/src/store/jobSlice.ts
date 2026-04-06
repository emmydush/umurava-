import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  workType: string;
  isActive: boolean;
  createdAt: string;
}

interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    search: string;
  };
}

const initialState: JobState = {
  jobs: [],
  currentJob: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    search: '',
  },
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs = action.payload;
    },
    setCurrentJob: (state, action: PayloadAction<Job | null>) => {
      state.currentJob = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<JobState['filters']>>) => {
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

export const { setJobs, setCurrentJob, setFilters, setLoading, setError } = jobSlice.actions;
export default jobSlice.reducer;

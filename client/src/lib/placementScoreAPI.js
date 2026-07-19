import api from './api';

export const placementScoreAPI = {
  getScore: (targetCompany = 'general') =>
    api.get(`/user/placement-score?company=${targetCompany}`),
};
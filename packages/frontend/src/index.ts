import { getWorkflowState } from './workflows';

const roles = ['admin', 'instructor', 'student'] as const;

for (const role of roles) {
  const state = getWorkflowState(role);
  console.log(`${role}: ${state.landingPage}`);
}

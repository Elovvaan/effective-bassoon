export const DEMO_PASSWORD = __ENV.DEMO_PASSWORD || 'Password123!';

export const CREDENTIALS = {
  districtAdmin: {
    email: __ENV.DISTRICT_ADMIN_EMAIL || 'district.admin@metro.demo',
    password: DEMO_PASSWORD,
    role: 'district_admin',
  },
  schoolAdmin: {
    email: __ENV.SCHOOL_ADMIN_EMAIL || 'principal.nhs@metro.demo',
    password: DEMO_PASSWORD,
    role: 'school_admin',
  },
  teacher: {
    email: __ENV.TEACHER_EMAIL || 'teacher1@metro.demo',
    password: DEMO_PASSWORD,
    role: 'teacher',
  },
  student: {
    email: __ENV.STUDENT_EMAIL || 'student1@metro.demo',
    password: DEMO_PASSWORD,
    role: 'student',
  },
};

const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const roleNames = [
    ['DISTRICT_ADMIN', 'District-level administrator'],
    ['SCHOOL_ADMIN', 'School principal or assistant principal'],
    ['TEACHER', 'Classroom teacher'],
    ['STUDENT', 'Student learner'],
    ['GRADER', 'Assessment specialist'],
  ];

  const roles = {};
  for (const [name, description] of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: { description },
      create: { name, description },
    });
  }

  const district = await prisma.district.upsert({
    where: { slug: 'metro-demo' },
    update: { name: 'Metro Demo District', stateCode: 'CA' },
    create: { name: 'Metro Demo District', slug: 'metro-demo', stateCode: 'CA' },
  });

  const northHigh = await prisma.school.upsert({
    where: {
      districtId_code: {
        districtId: district.id,
        code: 'NHS',
      },
    },
    update: { name: 'North High School', timezone: 'America/Los_Angeles' },
    create: {
      districtId: district.id,
      name: 'North High School',
      code: 'NHS',
      timezone: 'America/Los_Angeles',
    },
  });

  const westMiddle = await prisma.school.upsert({
    where: {
      districtId_code: {
        districtId: district.id,
        code: 'WMS',
      },
    },
    update: { name: 'West Middle School', timezone: 'America/Los_Angeles' },
    create: {
      districtId: district.id,
      name: 'West Middle School',
      code: 'WMS',
      timezone: 'America/Los_Angeles',
    },
  });

  const usersToCreate = [
    {
      email: 'amaya.patel@metro.demo',
      firstName: 'Amaya',
      lastName: 'Patel',
      roleId: roles.DISTRICT_ADMIN.id,
      schoolId: null,
      externalId: 'EMP-1001',
    },
    {
      email: 'jon.kim@nhs.metro.demo',
      firstName: 'Jon',
      lastName: 'Kim',
      roleId: roles.SCHOOL_ADMIN.id,
      schoolId: northHigh.id,
      externalId: 'EMP-2101',
    },
    {
      email: 'laura.garcia@nhs.metro.demo',
      firstName: 'Laura',
      lastName: 'Garcia',
      roleId: roles.TEACHER.id,
      schoolId: northHigh.id,
      externalId: 'EMP-2404',
    },
    {
      email: 'michael.ross@wms.metro.demo',
      firstName: 'Michael',
      lastName: 'Ross',
      roleId: roles.TEACHER.id,
      schoolId: westMiddle.id,
      externalId: 'EMP-2405',
    },
    {
      email: 'nora.owens@metro.demo',
      firstName: 'Nora',
      lastName: 'Owens',
      roleId: roles.GRADER.id,
      schoolId: null,
      externalId: 'EMP-3011',
    },
    {
      email: 'ava.johnson@student.metro.demo',
      firstName: 'Ava',
      lastName: 'Johnson',
      roleId: roles.STUDENT.id,
      schoolId: northHigh.id,
      externalId: 'STU-9001',
    },
    {
      email: 'liam.nguyen@student.metro.demo',
      firstName: 'Liam',
      lastName: 'Nguyen',
      roleId: roles.STUDENT.id,
      schoolId: northHigh.id,
      externalId: 'STU-9002',
    },
    {
      email: 'emma.wright@student.metro.demo',
      firstName: 'Emma',
      lastName: 'Wright',
      roleId: roles.STUDENT.id,
      schoolId: westMiddle.id,
      externalId: 'STU-9101',
    },
  ];

  const users = {};
  for (const userData of usersToCreate) {
    users[userData.email] = await prisma.user.upsert({
      where: {
        districtId_email: {
          districtId: district.id,
          email: userData.email,
        },
      },
      update: userData,
      create: {
        districtId: district.id,
        ...userData,
      },
    });
  }

  const elaClass = await prisma.classroom.upsert({
    where: {
      schoolId_courseCode_academicYear_term_period: {
        schoolId: northHigh.id,
        courseCode: 'ELA-9',
        academicYear: '2025-2026',
        term: 'Fall',
        period: '2',
      },
    },
    update: { name: 'ELA Grade 9 - Period 2', teacherId: users['laura.garcia@nhs.metro.demo'].id },
    create: {
      districtId: district.id,
      schoolId: northHigh.id,
      teacherId: users['laura.garcia@nhs.metro.demo'].id,
      name: 'ELA Grade 9 - Period 2',
      courseCode: 'ELA-9',
      academicYear: '2025-2026',
      term: 'Fall',
      period: '2',
    },
  });

  const historyClass = await prisma.classroom.upsert({
    where: {
      schoolId_courseCode_academicYear_term_period: {
        schoolId: westMiddle.id,
        courseCode: 'HIST-7',
        academicYear: '2025-2026',
        term: 'Fall',
        period: '4',
      },
    },
    update: { name: 'World History 7 - Period 4', teacherId: users['michael.ross@wms.metro.demo'].id },
    create: {
      districtId: district.id,
      schoolId: westMiddle.id,
      teacherId: users['michael.ross@wms.metro.demo'].id,
      name: 'World History 7 - Period 4',
      courseCode: 'HIST-7',
      academicYear: '2025-2026',
      term: 'Fall',
      period: '4',
    },
  });

  const enrollmentRows = [
    { classroomId: elaClass.id, schoolId: northHigh.id, studentId: users['ava.johnson@student.metro.demo'].id },
    { classroomId: elaClass.id, schoolId: northHigh.id, studentId: users['liam.nguyen@student.metro.demo'].id },
    { classroomId: historyClass.id, schoolId: westMiddle.id, studentId: users['emma.wright@student.metro.demo'].id },
  ];

  for (const enrollment of enrollmentRows) {
    await prisma.enrollment.upsert({
      where: {
        classroomId_studentId: {
          classroomId: enrollment.classroomId,
          studentId: enrollment.studentId,
        },
      },
      update: { status: 'ACTIVE' },
      create: {
        districtId: district.id,
        schoolId: enrollment.schoolId,
        classroomId: enrollment.classroomId,
        studentId: enrollment.studentId,
        status: 'ACTIVE',
      },
    });
  }

  const writingRubric = await prisma.rubric.upsert({
    where: {
      districtId_name_version: {
        districtId: district.id,
        name: 'Argumentative Writing Rubric',
        version: 1,
      },
    },
    update: { schoolId: northHigh.id },
    create: {
      districtId: district.id,
      schoolId: northHigh.id,
      name: 'Argumentative Writing Rubric',
      description: 'Core writing skills for thesis-driven essays',
      version: 1,
    },
  });

  const criteria = [
    ['Claim and Focus', 'Strong thesis and sustained argument', 1, '4.00'],
    ['Evidence', 'Appropriate and integrated textual evidence', 2, '4.00'],
    ['Organization', 'Logical structure and transitions', 3, '4.00'],
  ];

  for (const [title, description, displayOrder, maxScore] of criteria) {
    await prisma.rubricCriterion.upsert({
      where: { rubricId_displayOrder: { rubricId: writingRubric.id, displayOrder } },
      update: { title, description, maxScore: new Prisma.Decimal(maxScore), weight: new Prisma.Decimal('1.00') },
      create: {
        rubricId: writingRubric.id,
        title,
        description,
        displayOrder,
        maxScore: new Prisma.Decimal(maxScore),
        weight: new Prisma.Decimal('1.00'),
      },
    });
  }

  const assignment = await prisma.assignment.create({
    data: {
      districtId: district.id,
      schoolId: northHigh.id,
      classroomId: elaClass.id,
      creatorId: users['laura.garcia@nhs.metro.demo'].id,
      rubricId: writingRubric.id,
      title: 'Literary Analysis Essay',
      description: 'Analyze a central theme from the class novel using evidence from at least two chapters.',
      dueAt: new Date('2025-10-15T23:59:00.000Z'),
      maxPoints: new Prisma.Decimal('12.00'),
    },
  });

  const studentAva = users['ava.johnson@student.metro.demo'];
  const submission = await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: assignment.id,
        studentId: studentAva.id,
      },
    },
    update: {
      status: 'SUBMITTED',
      submittedAt: new Date('2025-10-14T20:42:00.000Z'),
    },
    create: {
      districtId: district.id,
      schoolId: northHigh.id,
      classroomId: elaClass.id,
      assignmentId: assignment.id,
      studentId: studentAva.id,
      status: 'SUBMITTED',
      submittedAt: new Date('2025-10-14T20:42:00.000Z'),
    },
  });

  const version1 = await prisma.submissionVersion.upsert({
    where: {
      submissionId_versionNumber: {
        submissionId: submission.id,
        versionNumber: 1,
      },
    },
    update: {
      body: 'Draft version focused on claim and basic textual support.',
      submittedAt: new Date('2025-10-10T21:03:00.000Z'),
    },
    create: {
      submissionId: submission.id,
      versionNumber: 1,
      body: 'Draft version focused on claim and basic textual support.',
      submittedAt: new Date('2025-10-10T21:03:00.000Z'),
    },
  });

  const version2 = await prisma.submissionVersion.upsert({
    where: {
      submissionId_versionNumber: {
        submissionId: submission.id,
        versionNumber: 2,
      },
    },
    update: {
      body: 'Final submission with revised thesis and stronger evidence integration.',
      submittedAt: new Date('2025-10-14T20:42:00.000Z'),
    },
    create: {
      submissionId: submission.id,
      versionNumber: 2,
      body: 'Final submission with revised thesis and stronger evidence integration.',
      submittedAt: new Date('2025-10-14T20:42:00.000Z'),
    },
  });

  await prisma.submission.update({
    where: { id: submission.id },
    data: { currentVersionId: version2.id },
  });

  const rubricCriteria = await prisma.rubricCriterion.findMany({ where: { rubricId: writingRubric.id } });
  for (const criterion of rubricCriteria) {
    const points = criterion.displayOrder === 1 ? '3.50' : criterion.displayOrder === 2 ? '3.00' : '2.50';
    await prisma.score.upsert({
      where: {
        submissionVersionId_criterionId: {
          submissionVersionId: version2.id,
          criterionId: criterion.id,
        },
      },
      update: {
        evaluatorId: users['nora.owens@metro.demo'].id,
        pointsAwarded: new Prisma.Decimal(points),
        feedback: 'Clear progress from draft to final.',
      },
      create: {
        districtId: district.id,
        schoolId: northHigh.id,
        submissionVersionId: version2.id,
        criterionId: criterion.id,
        evaluatorId: users['nora.owens@metro.demo'].id,
        pointsAwarded: new Prisma.Decimal(points),
        feedback: 'Clear progress from draft to final.',
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      districtId: district.id,
      schoolId: northHigh.id,
      actorUserId: users['laura.garcia@nhs.metro.demo'].id,
      entityType: 'Submission',
      entityId: submission.id,
      action: 'GRADE_POSTED',
      metadata: {
        assignmentTitle: assignment.title,
        studentEmail: studentAva.email,
        versionNumber: 2,
      },
    },
  });

  console.log('Seed complete: district, schools, users, classrooms, assignments, submissions, and scores.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Prisma, PrismaClient } from '@prisma/client'
import type { SubmissionStatus, UserRole } from '@packages/types'

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'Password123!'
const ACADEMIC_YEAR = '2025-2026'

const roleDescriptions = {
  DISTRICT_ADMIN: 'District-level administrator',
  SCHOOL_ADMIN: 'School principal or assistant principal',
  TEACHER: 'Classroom teacher',
  STUDENT: 'Student learner'
} as const

type DbRoleName = keyof typeof roleDescriptions

const userRoleToDbRole: Record<UserRole, DbRoleName> = {
  district_admin: 'DISTRICT_ADMIN',
  school_admin: 'SCHOOL_ADMIN',
  teacher: 'TEACHER',
  student: 'STUDENT'
}

const dbRoleToUserRole: Record<DbRoleName, UserRole> = {
  DISTRICT_ADMIN: 'district_admin',
  SCHOOL_ADMIN: 'school_admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
}

type SeedSchool = { id: string; name: string; code: string }
type SeedUser = {
  id: string
  schoolId: string | null
  role: UserRole
  email: string
  firstName: string
  lastName: string
}
type SeedClassroom = { id: string; schoolId: string; teacherId: string; name: string }
type SeedAssignment = { id: string; classroomId: string; schoolId: string; title: string }

function logStep(step: string): void {
  console.log(`\n[seed] ${step}`)
}

async function clearExistingData(): Promise<void> {
  logStep('Clearing existing data')
  await prisma.score.deleteMany()
  await prisma.submissionVersion.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.classroom.deleteMany()
  await prisma.rubricCriterion.deleteMany()
  await prisma.rubric.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()
  await prisma.school.deleteMany()
  await prisma.district.deleteMany()
  await prisma.role.deleteMany()
}

async function seedRoles(): Promise<Record<DbRoleName, { id: string }>> {
  logStep('Creating roles')

  const createdRoles = await Promise.all(
    Object.entries(roleDescriptions).map(([name, description]) =>
      prisma.role.create({ data: { name, description }, select: { id: true, name: true } })
    )
  )

  const roleMap = {} as Record<DbRoleName, { id: string }>
  for (const role of createdRoles) {
    roleMap[role.name as DbRoleName] = { id: role.id }
  }

  return roleMap
}

async function seedDistrictAndSchools(): Promise<{ districtId: string; schools: SeedSchool[] }> {
  logStep('Creating district and schools')

  const district = await prisma.district.create({
    data: { name: 'Metro Demo District', slug: 'metro-demo', stateCode: 'CA' },
    select: { id: true }
  })

  const schools = await prisma.$transaction([
    prisma.school.create({
      data: { districtId: district.id, name: 'North High School', code: 'NHS', timezone: 'America/Los_Angeles' },
      select: { id: true, name: true, code: true }
    }),
    prisma.school.create({
      data: { districtId: district.id, name: 'West Middle School', code: 'WMS', timezone: 'America/Los_Angeles' },
      select: { id: true, name: true, code: true }
    })
  ])

  return { districtId: district.id, schools }
}

async function createUser(
  districtId: string,
  roles: Record<DbRoleName, { id: string }>,
  payload: Omit<SeedUser, 'id'> & { externalId: string }
): Promise<SeedUser> {
  const dbRoleName = userRoleToDbRole[payload.role]

  const user = await prisma.user.create({
    data: {
      districtId,
      schoolId: payload.schoolId,
      roleId: roles[dbRoleName].id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      externalId: payload.externalId,
      isActive: true
    },
    select: {
      id: true,
      schoolId: true,
      email: true,
      firstName: true,
      lastName: true,
      role: { select: { name: true } }
    }
  })

  return {
    id: user.id,
    schoolId: user.schoolId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: dbRoleToUserRole[user.role.name as DbRoleName]
  }
}

async function seedUsers(
  districtId: string,
  schools: SeedSchool[],
  roles: Record<DbRoleName, { id: string }>
): Promise<{ admins: SeedUser[]; teachers: SeedUser[]; students: SeedUser[] }> {
  logStep('Creating district, school admins, teachers, and students')

  const northSchool = schools.find((school) => school.code === 'NHS')
  const westSchool = schools.find((school) => school.code === 'WMS')

  if (!northSchool || !westSchool) throw new Error('Expected demo schools were not created')

  const admins: SeedUser[] = [
    await createUser(districtId, roles, {
      schoolId: null,
      role: 'district_admin',
      email: 'district.admin@metro.demo',
      firstName: 'Avery',
      lastName: 'Brooks',
      externalId: 'EMP-1000'
    }),
    await createUser(districtId, roles, {
      schoolId: northSchool.id,
      role: 'school_admin',
      email: 'principal.nhs@metro.demo',
      firstName: 'Camila',
      lastName: 'Santos',
      externalId: 'EMP-2100'
    }),
    await createUser(districtId, roles, {
      schoolId: westSchool.id,
      role: 'school_admin',
      email: 'principal.wms@metro.demo',
      firstName: 'Darius',
      lastName: 'Coleman',
      externalId: 'EMP-2101'
    })
  ]

  const teacherProfiles = [
    ['Mia', 'Nguyen', northSchool.id],
    ['Jordan', 'Perez', northSchool.id],
    ['Elena', 'Wright', northSchool.id],
    ['Noah', 'Patel', westSchool.id],
    ['Sofia', 'Reed', westSchool.id]
  ] as const

  const teachers = await Promise.all(
    teacherProfiles.map(([firstName, lastName, schoolId], index) =>
      createUser(districtId, roles, {
        schoolId,
        role: 'teacher',
        email: `teacher${index + 1}@metro.demo`,
        firstName,
        lastName,
        externalId: `EMP-24${String(index).padStart(2, '0')}`
      })
    )
  )

  const firstNames = [
    'Aiden', 'Olivia', 'Lucas', 'Emma', 'Mason', 'Sophia', 'Ethan', 'Mila', 'Logan', 'Aria',
    'Henry', 'Harper', 'Sebastian', 'Luna', 'Jackson', 'Chloe', 'Levi', 'Ellie', 'Wyatt', 'Nora',
    'Owen', 'Grace', 'Isaac', 'Hazel', 'Julian', 'Violet', 'Caleb', 'Stella', 'Leo', 'Zoe',
    'Mateo', 'Riley', 'Asher', 'Lily', 'Ezra', 'Aubrey', 'Kai', 'Hannah', 'Eli', 'Layla'
  ]
  const lastNames = [
    'Adams', 'Baker', 'Cruz', 'Diaz', 'Evans', 'Flores', 'Gray', 'Hughes', 'Ingram', 'James',
    'Khan', 'Lopez', 'Mitchell', 'Nelson', 'Ortiz', 'Price', 'Quinn', 'Rivera', 'Stewart', 'Turner',
    'Underwood', 'Vargas', 'Walker', 'Xu', 'Young', 'Zimmerman', 'Allen', 'Brooks', 'Campbell', 'Davis',
    'Edwards', 'Foster', 'Gomez', 'Hall', 'Iverson', 'Johnson', 'Kim', 'Lewis', 'Moore', 'Norris'
  ]

  const students = await Promise.all(
    Array.from({ length: 40 }, (_, index) =>
      createUser(districtId, roles, {
        schoolId: index < 20 ? northSchool.id : westSchool.id,
        role: 'student',
        email: `student${index + 1}@metro.demo`,
        firstName: firstNames[index] ?? `Student${index + 1}`,
        lastName: lastNames[index] ?? 'Learner',
        externalId: `STU-${9000 + index}`
      })
    )
  )

  return { admins, teachers, students }
}

async function seedClassrooms(districtId: string, teachers: SeedUser[]): Promise<SeedClassroom[]> {
  logStep('Creating classrooms for each teacher')

  const subjects = ['ELA', 'Math', 'Science'] as const
  const classrooms: SeedClassroom[] = []

  for (const [teacherIndex, teacher] of teachers.entries()) {
    if (!teacher.schoolId) continue

    for (const [subjectIndex, subject] of subjects.entries()) {
      const classroom = await prisma.classroom.create({
        data: {
          districtId,
          schoolId: teacher.schoolId,
          teacherId: teacher.id,
          name: `${subject} ${teacher.lastName} - Period ${subjectIndex + 1}`,
          courseCode: `${subject}-${teacherIndex + 1}${subjectIndex + 1}`,
          academicYear: ACADEMIC_YEAR,
          term: 'Fall',
          period: String(subjectIndex + 1)
        },
        select: { id: true, schoolId: true, teacherId: true, name: true }
      })
      classrooms.push(classroom)
    }
  }

  return classrooms
}

async function seedEnrollments(districtId: string, students: SeedUser[], classrooms: SeedClassroom[]): Promise<void> {
  logStep('Creating enrollments and distributing students across classes')

  for (const [index, student] of students.entries()) {
    const eligibleClassrooms = classrooms.filter((room) => room.schoolId === student.schoolId)
    if (eligibleClassrooms.length === 0) continue

    for (let offset = 0; offset < 3; offset += 1) {
      const classroom = eligibleClassrooms[(index + offset) % eligibleClassrooms.length]
      if (!classroom) continue

      await prisma.enrollment.create({
        data: {
          districtId,
          schoolId: classroom.schoolId,
          classroomId: classroom.id,
          studentId: student.id,
          status: 'ACTIVE'
        }
      })
    }
  }
}

async function seedRubric(districtId: string, schoolId: string): Promise<{ id: string; criteriaIds: string[] }> {
  logStep('Creating writing rubric')

  const rubric = await prisma.rubric.create({
    data: {
      districtId,
      schoolId,
      name: 'Argumentative Writing Rubric',
      description: 'Core writing rubric for thesis, evidence, and organization',
      version: 1
    },
    select: { id: true }
  })

  const criteria = await Promise.all(
    [
      { title: 'Claim and Focus', description: 'Presents a clear and sustained claim', maxScore: '4.00', weight: '1.00', displayOrder: 1 },
      {
        title: 'Evidence and Elaboration',
        description: 'Uses relevant textual evidence and explains reasoning',
        maxScore: '4.00',
        weight: '1.25',
        displayOrder: 2
      },
      { title: 'Organization and Conventions', description: 'Uses logical structure and grade-level conventions', maxScore: '4.00', weight: '1.00', displayOrder: 3 }
    ].map((criterion) =>
      prisma.rubricCriterion.create({
        data: {
          rubricId: rubric.id,
          title: criterion.title,
          description: criterion.description,
          maxScore: new Prisma.Decimal(criterion.maxScore),
          weight: new Prisma.Decimal(criterion.weight),
          displayOrder: criterion.displayOrder
        },
        select: { id: true }
      })
    )
  )

  return { id: rubric.id, criteriaIds: criteria.map((criterion) => criterion.id) }
}

async function seedAssignments(districtId: string, classrooms: SeedClassroom[], rubricId: string): Promise<SeedAssignment[]> {
  logStep('Creating assignments for every class')

  const templates = [
    { title: 'Narrative Response Draft', description: 'Write a first draft response using class readings.', maxPoints: '15.00' },
    { title: 'Evidence-Based Paragraph', description: 'Submit an evidence-based paragraph with analysis.', maxPoints: '20.00' },
    { title: 'Final Written Assessment', description: 'Revise and submit your final polished writing assessment.', maxPoints: '25.00' }
  ]

  const assignments: SeedAssignment[] = []

  for (const classroom of classrooms) {
    for (const [index, template] of templates.entries()) {
      const assignment = await prisma.assignment.create({
        data: {
          districtId,
          schoolId: classroom.schoolId,
          classroomId: classroom.id,
          creatorId: classroom.teacherId,
          rubricId,
          title: `${template.title} - ${classroom.name}`,
          description: template.description,
          dueAt: new Date(Date.UTC(2025, 8, 15 + index * 14, 23, 59, 0)),
          maxPoints: new Prisma.Decimal(template.maxPoints)
        },
        select: { id: true, schoolId: true, classroomId: true, title: true }
      })
      assignments.push(assignment)
    }
  }

  return assignments
}

function getSubmissionStatus(index: number): SubmissionStatus {
  if (index % 5 === 0) return 'DRAFT'
  if (index % 3 === 0) return 'GRADED'
  return 'SUBMITTED'
}

async function seedSubmissionsAndScores(districtId: string, assignments: SeedAssignment[], criteriaIds: string[]): Promise<void> {
  logStep('Creating submissions with mixed status and scoring')

  for (const assignment of assignments) {
    const classroom = await prisma.classroom.findUnique({ where: { id: assignment.classroomId }, select: { teacherId: true } })
    if (!classroom) continue

    const enrollments = await prisma.enrollment.findMany({
      where: { classroomId: assignment.classroomId, status: 'ACTIVE' },
      select: { studentId: true }
    })

    for (const [index, enrollment] of enrollments.entries()) {
      const status = getSubmissionStatus(index)
      const submittedAt = status === 'DRAFT' ? null : new Date(Date.UTC(2025, 8, 10 + (index % 10), 18, 15, 0))
      const gradedAt = status === 'GRADED' ? new Date(Date.UTC(2025, 8, 20 + (index % 6), 19, 45, 0)) : null

      const submission = await prisma.submission.create({
        data: {
          districtId,
          schoolId: assignment.schoolId,
          classroomId: assignment.classroomId,
          assignmentId: assignment.id,
          studentId: enrollment.studentId,
          status,
          submittedAt,
          gradedAt
        },
        select: { id: true }
      })

      const version = await prisma.submissionVersion.create({
        data: {
          submissionId: submission.id,
          versionNumber: 1,
          body: status === 'DRAFT' ? 'Working draft in progress.' : `Submission for ${assignment.title}`,
          submittedAt
        },
        select: { id: true }
      })

      await prisma.submission.update({ where: { id: submission.id }, data: { currentVersionId: version.id } })

      if (status === 'GRADED') {
        await Promise.all(
          criteriaIds.map((criterionId, criterionIndex) =>
            prisma.score.create({
              data: {
                districtId,
                schoolId: assignment.schoolId,
                submissionVersionId: version.id,
                criterionId,
                evaluatorId: classroom.teacherId,
                pointsAwarded: new Prisma.Decimal((2.8 + (criterionIndex % 2) + (index % 2) * 0.5).toFixed(2)),
                feedback: 'Demonstrates progress and clear next steps.'
              }
            })
          )
        )
      }
    }
  }
}

async function seedAuditLogs(districtId: string, admins: SeedUser[], assignments: SeedAssignment[]): Promise<void> {
  logStep('Creating audit logs')

  const districtAdmin = admins.find((admin) => admin.role === 'district_admin')
  const schoolAdmin = admins.find((admin) => admin.role === 'school_admin')
  if (!districtAdmin || !schoolAdmin) throw new Error('Missing admin users for audit logs')

  await prisma.auditLog.createMany({
    data: [
      {
        districtId,
        schoolId: null,
        actorUserId: districtAdmin.id,
        entityType: 'District',
        entityId: districtId,
        action: 'SEED_BOOTSTRAP_COMPLETED',
        metadata: { source: 'seed.ts', notes: 'Local demo dataset initialized' }
      },
      {
        districtId,
        schoolId: schoolAdmin.schoolId,
        actorUserId: schoolAdmin.id,
        entityType: 'Assignment',
        entityId: assignments[0]?.id ?? districtId,
        action: 'ASSIGNMENT_BATCH_CREATED',
        metadata: { assignmentCount: assignments.length }
      },
      {
        districtId,
        schoolId: schoolAdmin.schoolId,
        actorUserId: schoolAdmin.id,
        entityType: 'Analytics',
        entityId: districtId,
        action: 'DASHBOARD_VIEWED',
        metadata: { scope: 'school', filters: { academicYear: ACADEMIC_YEAR } }
      }
    ]
  })
}

async function main(): Promise<void> {
  logStep('Starting database seed')

  await clearExistingData()
  const roles = await seedRoles()
  const { districtId, schools } = await seedDistrictAndSchools()
  const { admins, teachers, students } = await seedUsers(districtId, schools, roles)
  const classrooms = await seedClassrooms(districtId, teachers)

  await seedEnrollments(districtId, students, classrooms)

  const rubricSchool = schools[0]
  if (!rubricSchool) throw new Error('Unable to create rubric due to missing school')

  const rubric = await seedRubric(districtId, rubricSchool.id)
  const assignments = await seedAssignments(districtId, classrooms, rubric.id)

  await seedSubmissionsAndScores(districtId, assignments, rubric.criteriaIds)
  await seedAuditLogs(districtId, admins, assignments)

  logStep('Seed completed successfully')
  console.log(`[seed] Demo user password (for local auth mocks): ${DEMO_PASSWORD}`)
  console.log('[seed] Accounts: district.admin@metro.demo, principal.nhs@metro.demo, principal.wms@metro.demo, teacher1@metro.demo, student1@metro.demo')
}

main()
  .catch((error: unknown) => {
    console.error('[seed] Seed failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

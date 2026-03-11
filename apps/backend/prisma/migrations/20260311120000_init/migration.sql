-- Create enums
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'DROPPED', 'COMPLETED');
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RETURNED', 'GRADED');

-- CreateTable
CREATE TABLE "District" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "stateCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "School" (
  "id" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "timezone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Role" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "schoolId" TEXT,
  "roleId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "externalId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Classroom" (
  "id" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "courseCode" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "term" TEXT,
  "period" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Enrollment" (
  "id" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "exitedAt" TIMESTAMP(3),
  CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Rubric" (
  "id" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "schoolId" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Rubric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RubricCriterion" (
  "id" TEXT NOT NULL,
  "rubricId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "weight" DECIMAL(4,2) NOT NULL DEFAULT 1,
  "maxScore" DECIMAL(5,2) NOT NULL,
  "displayOrder" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Assignment" (
  "id" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "rubricId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dueAt" TIMESTAMP(3),
  "maxPoints" DECIMAL(5,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Submission" (
  "id" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "classroomId" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
  "submittedAt" TIMESTAMP(3),
  "gradedAt" TIMESTAMP(3),
  "currentVersionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubmissionVersion" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "body" TEXT,
  "attachmentUrl" TEXT,
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubmissionVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Score" (
  "id" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "submissionVersionId" TEXT NOT NULL,
  "criterionId" TEXT NOT NULL,
  "evaluatorId" TEXT NOT NULL,
  "pointsAwarded" DECIMAL(5,2) NOT NULL,
  "feedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "districtId" TEXT NOT NULL,
  "schoolId" TEXT,
  "actorUserId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Uniques
CREATE UNIQUE INDEX "District_slug_key" ON "District"("slug");
CREATE UNIQUE INDEX "School_districtId_code_key" ON "School"("districtId", "code");
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE UNIQUE INDEX "User_districtId_email_key" ON "User"("districtId", "email");
CREATE UNIQUE INDEX "Enrollment_classroomId_studentId_key" ON "Enrollment"("classroomId", "studentId");
CREATE UNIQUE INDEX "Classroom_schoolId_courseCode_academicYear_term_period_key" ON "Classroom"("schoolId", "courseCode", "academicYear", "term", "period");
CREATE UNIQUE INDEX "Rubric_districtId_name_version_key" ON "Rubric"("districtId", "name", "version");
CREATE UNIQUE INDEX "RubricCriterion_rubricId_displayOrder_key" ON "RubricCriterion"("rubricId", "displayOrder");
CREATE UNIQUE INDEX "Submission_assignmentId_studentId_key" ON "Submission"("assignmentId", "studentId");
CREATE UNIQUE INDEX "Submission_currentVersionId_key" ON "Submission"("currentVersionId");
CREATE UNIQUE INDEX "SubmissionVersion_submissionId_versionNumber_key" ON "SubmissionVersion"("submissionId", "versionNumber");
CREATE UNIQUE INDEX "Score_submissionVersionId_criterionId_key" ON "Score"("submissionVersionId", "criterionId");

-- Analytics/scoping indexes
CREATE INDEX "District_createdAt_idx" ON "District"("createdAt");
CREATE INDEX "School_districtId_createdAt_idx" ON "School"("districtId", "createdAt");
CREATE INDEX "User_schoolId_roleId_idx" ON "User"("schoolId", "roleId");
CREATE INDEX "User_districtId_isActive_idx" ON "User"("districtId", "isActive");
CREATE INDEX "Enrollment_districtId_schoolId_status_idx" ON "Enrollment"("districtId", "schoolId", "status");
CREATE INDEX "Enrollment_studentId_status_idx" ON "Enrollment"("studentId", "status");
CREATE INDEX "Classroom_districtId_schoolId_academicYear_idx" ON "Classroom"("districtId", "schoolId", "academicYear");
CREATE INDEX "Classroom_teacherId_academicYear_idx" ON "Classroom"("teacherId", "academicYear");
CREATE INDEX "Assignment_districtId_schoolId_dueAt_idx" ON "Assignment"("districtId", "schoolId", "dueAt");
CREATE INDEX "Assignment_classroomId_createdAt_idx" ON "Assignment"("classroomId", "createdAt");
CREATE INDEX "Assignment_rubricId_idx" ON "Assignment"("rubricId");
CREATE INDEX "Rubric_districtId_schoolId_createdAt_idx" ON "Rubric"("districtId", "schoolId", "createdAt");
CREATE INDEX "RubricCriterion_rubricId_createdAt_idx" ON "RubricCriterion"("rubricId", "createdAt");
CREATE INDEX "Submission_districtId_schoolId_status_submittedAt_idx" ON "Submission"("districtId", "schoolId", "status", "submittedAt");
CREATE INDEX "Submission_assignmentId_status_idx" ON "Submission"("assignmentId", "status");
CREATE INDEX "SubmissionVersion_submissionId_createdAt_idx" ON "SubmissionVersion"("submissionId", "createdAt");
CREATE INDEX "Score_districtId_schoolId_createdAt_idx" ON "Score"("districtId", "schoolId", "createdAt");
CREATE INDEX "Score_evaluatorId_createdAt_idx" ON "Score"("evaluatorId", "createdAt");
CREATE INDEX "AuditLog_districtId_schoolId_createdAt_idx" ON "AuditLog"("districtId", "schoolId", "createdAt");
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

-- Foreign keys
ALTER TABLE "School"
  ADD CONSTRAINT "School_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User"
  ADD CONSTRAINT "User_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User"
  ADD CONSTRAINT "User_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User"
  ADD CONSTRAINT "User_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Classroom"
  ADD CONSTRAINT "Classroom_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Classroom"
  ADD CONSTRAINT "Classroom_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Classroom"
  ADD CONSTRAINT "Classroom_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_classroomId_fkey"
  FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enrollment"
  ADD CONSTRAINT "Enrollment_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Rubric"
  ADD CONSTRAINT "Rubric_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rubric"
  ADD CONSTRAINT "Rubric_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RubricCriterion"
  ADD CONSTRAINT "RubricCriterion_rubricId_fkey"
  FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Assignment"
  ADD CONSTRAINT "Assignment_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment"
  ADD CONSTRAINT "Assignment_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment"
  ADD CONSTRAINT "Assignment_classroomId_fkey"
  FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment"
  ADD CONSTRAINT "Assignment_creatorId_fkey"
  FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Assignment"
  ADD CONSTRAINT "Assignment_rubricId_fkey"
  FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_classroomId_fkey"
  FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_assignmentId_fkey"
  FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubmissionVersion"
  ADD CONSTRAINT "SubmissionVersion_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Submission"
  ADD CONSTRAINT "Submission_currentVersionId_fkey"
  FOREIGN KEY ("currentVersionId") REFERENCES "SubmissionVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Score"
  ADD CONSTRAINT "Score_submissionVersionId_fkey"
  FOREIGN KEY ("submissionVersionId") REFERENCES "SubmissionVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Score"
  ADD CONSTRAINT "Score_criterionId_fkey"
  FOREIGN KEY ("criterionId") REFERENCES "RubricCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Score"
  ADD CONSTRAINT "Score_evaluatorId_fkey"
  FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_districtId_fkey"
  FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

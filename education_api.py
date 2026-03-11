from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
import csv
from io import StringIO
from typing import Dict, List, Optional


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class ValidationErrorDetail:
    row: int
    field: str
    message: str


@dataclass
class EnrollmentImportReport:
    students_imported: int
    classes_imported: int
    enrollments_imported: int
    errors: List[ValidationErrorDetail] = field(default_factory=list)


@dataclass
class Student:
    student_id: str
    name: str


@dataclass
class ClassRoom:
    class_id: str
    title: str


@dataclass
class Enrollment:
    student_id: str
    class_id: str


@dataclass
class RubricCriterion:
    criterion_id: str
    title: str
    max_points: float


@dataclass
class Assignment:
    assignment_id: str
    class_id: str
    title: str
    description: str
    rubric: List[RubricCriterion] = field(default_factory=list)
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)

    @property
    def max_points(self) -> float:
        return sum(c.max_points for c in self.rubric)


@dataclass
class DraftVersion:
    version: int
    content: str
    saved_at: datetime


@dataclass
class SubmissionVersion:
    version: int
    content: str
    submitted_at: datetime


@dataclass
class ScoreBreakdown:
    criterion_id: str
    awarded_points: float
    max_points: float


@dataclass
class ScoreResponse:
    assignment_id: str
    student_id: str
    total_points: float
    max_points: float
    breakdown: List[ScoreBreakdown]
    graded_at: datetime


@dataclass
class AssignmentResponse:
    assignment: Assignment


@dataclass
class ProgressByStudent:
    student_id: str
    completion_rate: float
    average_score: float


@dataclass
class TeacherProgressResponse:
    class_id: str
    assignment_count: int
    student_progress: List[ProgressByStudent]


@dataclass
class TimelineEvent:
    event_type: str
    assignment_id: str
    version: int
    timestamp: datetime


@dataclass
class StudentTimelineResponse:
    student_id: str
    events: List[TimelineEvent]


class EnrollmentService:
    def __init__(self) -> None:
        self.students: Dict[str, Student] = {}
        self.classes: Dict[str, ClassRoom] = {}
        self.enrollments: List[Enrollment] = []

    def import_csv(self, students_csv: str, classes_csv: str, enrollments_csv: str) -> EnrollmentImportReport:
        report = EnrollmentImportReport(0, 0, 0, [])

        for idx, row in enumerate(csv.DictReader(StringIO(students_csv)), start=2):
            student_id = (row.get("student_id") or "").strip()
            name = (row.get("name") or "").strip()
            if not student_id:
                report.errors.append(ValidationErrorDetail(idx, "student_id", "student_id is required"))
                continue
            if not name:
                report.errors.append(ValidationErrorDetail(idx, "name", "name is required"))
                continue
            if student_id in self.students:
                report.errors.append(ValidationErrorDetail(idx, "student_id", "duplicate student_id"))
                continue
            self.students[student_id] = Student(student_id=student_id, name=name)
            report.students_imported += 1

        for idx, row in enumerate(csv.DictReader(StringIO(classes_csv)), start=2):
            class_id = (row.get("class_id") or "").strip()
            title = (row.get("title") or "").strip()
            if not class_id:
                report.errors.append(ValidationErrorDetail(idx, "class_id", "class_id is required"))
                continue
            if not title:
                report.errors.append(ValidationErrorDetail(idx, "title", "title is required"))
                continue
            if class_id in self.classes:
                report.errors.append(ValidationErrorDetail(idx, "class_id", "duplicate class_id"))
                continue
            self.classes[class_id] = ClassRoom(class_id=class_id, title=title)
            report.classes_imported += 1

        seen = set((e.student_id, e.class_id) for e in self.enrollments)
        for idx, row in enumerate(csv.DictReader(StringIO(enrollments_csv)), start=2):
            student_id = (row.get("student_id") or "").strip()
            class_id = (row.get("class_id") or "").strip()
            if student_id not in self.students:
                report.errors.append(ValidationErrorDetail(idx, "student_id", "unknown student_id"))
                continue
            if class_id not in self.classes:
                report.errors.append(ValidationErrorDetail(idx, "class_id", "unknown class_id"))
                continue
            key = (student_id, class_id)
            if key in seen:
                report.errors.append(ValidationErrorDetail(idx, "enrollment", "duplicate enrollment"))
                continue
            self.enrollments.append(Enrollment(student_id=student_id, class_id=class_id))
            seen.add(key)
            report.enrollments_imported += 1

        return report

    def export_csv(self) -> Dict[str, str]:
        students_out = StringIO()
        sw = csv.DictWriter(students_out, fieldnames=["student_id", "name"])
        sw.writeheader()
        for student in self.students.values():
            sw.writerow({"student_id": student.student_id, "name": student.name})

        classes_out = StringIO()
        cw = csv.DictWriter(classes_out, fieldnames=["class_id", "title"])
        cw.writeheader()
        for classroom in self.classes.values():
            cw.writerow({"class_id": classroom.class_id, "title": classroom.title})

        enrollments_out = StringIO()
        ew = csv.DictWriter(enrollments_out, fieldnames=["student_id", "class_id"])
        ew.writeheader()
        for enrollment in self.enrollments:
            ew.writerow({"student_id": enrollment.student_id, "class_id": enrollment.class_id})

        return {
            "students_csv": students_out.getvalue(),
            "classes_csv": classes_out.getvalue(),
            "enrollments_csv": enrollments_out.getvalue(),
        }


class AssignmentService:
    def __init__(self, enrollment_service: EnrollmentService) -> None:
        self._enrollment_service = enrollment_service
        self.assignments: Dict[str, Assignment] = {}

    def create_assignment(self, assignment_id: str, class_id: str, title: str, description: str, rubric: List[RubricCriterion]) -> Assignment:
        if class_id not in self._enrollment_service.classes:
            raise ValueError("Unknown class_id")
        if assignment_id in self.assignments:
            raise ValueError("assignment_id already exists")
        self._validate_rubric(rubric)
        assignment = Assignment(
            assignment_id=assignment_id,
            class_id=class_id,
            title=title,
            description=description,
            rubric=rubric,
        )
        self.assignments[assignment_id] = assignment
        return assignment

    def edit_assignment(
        self,
        assignment_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        rubric: Optional[List[RubricCriterion]] = None,
    ) -> Assignment:
        assignment = self.assignments[assignment_id]
        if title is not None:
            assignment.title = title
        if description is not None:
            assignment.description = description
        if rubric is not None:
            self._validate_rubric(rubric)
            assignment.rubric = rubric
        assignment.updated_at = utc_now()
        return assignment

    @staticmethod
    def _validate_rubric(rubric: List[RubricCriterion]) -> None:
        if not rubric:
            raise ValueError("rubric must include at least one criterion")
        seen = set()
        for criterion in rubric:
            if criterion.criterion_id in seen:
                raise ValueError("duplicate criterion_id in rubric")
            if criterion.max_points <= 0:
                raise ValueError("criterion max_points must be > 0")
            seen.add(criterion.criterion_id)


class SubmissionService:
    def __init__(self, assignment_service: AssignmentService) -> None:
        self._assignment_service = assignment_service
        self.drafts: Dict[tuple[str, str], List[DraftVersion]] = {}
        self.submissions: Dict[tuple[str, str], List[SubmissionVersion]] = {}
        self.scores: Dict[tuple[str, str], ScoreResponse] = {}

    def autosave_draft(self, assignment_id: str, student_id: str, content: str) -> DraftVersion:
        self._validate_known_assignment(assignment_id)
        key = (assignment_id, student_id)
        versions = self.drafts.setdefault(key, [])
        version = DraftVersion(version=len(versions) + 1, content=content, saved_at=utc_now())
        versions.append(version)
        return version

    def submit(self, assignment_id: str, student_id: str, content: str) -> SubmissionVersion:
        self._validate_known_assignment(assignment_id)
        key = (assignment_id, student_id)
        versions = self.submissions.setdefault(key, [])
        version = SubmissionVersion(version=len(versions) + 1, content=content, submitted_at=utc_now())
        versions.append(version)
        return version

    def get_submission_history(self, assignment_id: str, student_id: str) -> List[SubmissionVersion]:
        return list(self.submissions.get((assignment_id, student_id), []))

    def score_submission(self, assignment_id: str, student_id: str, rubric_scores: Dict[str, float]) -> ScoreResponse:
        assignment = self._assignment_service.assignments[assignment_id]
        rubric_map = {criterion.criterion_id: criterion for criterion in assignment.rubric}
        if set(rubric_scores.keys()) != set(rubric_map.keys()):
            raise ValueError("rubric_scores must include exactly every criterion")

        breakdown: List[ScoreBreakdown] = []
        total = 0.0
        for criterion_id, awarded in rubric_scores.items():
            criterion = rubric_map[criterion_id]
            if awarded < 0 or awarded > criterion.max_points:
                raise ValueError(f"score for {criterion_id} is out of range")
            total += awarded
            breakdown.append(
                ScoreBreakdown(
                    criterion_id=criterion_id,
                    awarded_points=awarded,
                    max_points=criterion.max_points,
                )
            )

        result = ScoreResponse(
            assignment_id=assignment_id,
            student_id=student_id,
            total_points=total,
            max_points=assignment.max_points,
            breakdown=breakdown,
            graded_at=utc_now(),
        )
        self.scores[(assignment_id, student_id)] = result
        return result

    def _validate_known_assignment(self, assignment_id: str) -> None:
        if assignment_id not in self._assignment_service.assignments:
            raise ValueError("Unknown assignment_id")


class AnalyticsService:
    def __init__(self, enrollment_service: EnrollmentService, assignment_service: AssignmentService, submission_service: SubmissionService) -> None:
        self._enrollment_service = enrollment_service
        self._assignment_service = assignment_service
        self._submission_service = submission_service

    def teacher_progress(self, class_id: str) -> TeacherProgressResponse:
        class_students = [e.student_id for e in self._enrollment_service.enrollments if e.class_id == class_id]
        assignments = [a for a in self._assignment_service.assignments.values() if a.class_id == class_id]
        assignment_count = len(assignments)

        progress: List[ProgressByStudent] = []
        for student_id in class_students:
            completed = 0
            scores: List[float] = []
            for assignment in assignments:
                if self._submission_service.get_submission_history(assignment.assignment_id, student_id):
                    completed += 1
                score = self._submission_service.scores.get((assignment.assignment_id, student_id))
                if score:
                    scores.append((score.total_points / score.max_points) * 100 if score.max_points else 0)

            completion_rate = (completed / assignment_count) if assignment_count else 0.0
            avg_score = (sum(scores) / len(scores)) if scores else 0.0
            progress.append(ProgressByStudent(student_id=student_id, completion_rate=completion_rate, average_score=avg_score))

        return TeacherProgressResponse(class_id=class_id, assignment_count=assignment_count, student_progress=progress)

    def student_timeline(self, student_id: str) -> StudentTimelineResponse:
        events: List[TimelineEvent] = []
        for (assignment_id, sid), drafts in self._submission_service.drafts.items():
            if sid != student_id:
                continue
            for draft in drafts:
                events.append(
                    TimelineEvent(
                        event_type="draft_autosaved",
                        assignment_id=assignment_id,
                        version=draft.version,
                        timestamp=draft.saved_at,
                    )
                )

        for (assignment_id, sid), submissions in self._submission_service.submissions.items():
            if sid != student_id:
                continue
            for submission in submissions:
                events.append(
                    TimelineEvent(
                        event_type="submission_created",
                        assignment_id=assignment_id,
                        version=submission.version,
                        timestamp=submission.submitted_at,
                    )
                )

        for (assignment_id, sid), score in self._submission_service.scores.items():
            if sid != student_id:
                continue
            events.append(
                TimelineEvent(
                    event_type="submission_graded",
                    assignment_id=assignment_id,
                    version=0,
                    timestamp=score.graded_at,
                )
            )

        events.sort(key=lambda item: item.timestamp)
        return StudentTimelineResponse(student_id=student_id, events=events)


class EducationAPI:
    """Typed endpoint contracts for enrollment, assignments, scoring, and progress."""

    def __init__(self) -> None:
        self.enrollments = EnrollmentService()
        self.assignments = AssignmentService(self.enrollments)
        self.submissions = SubmissionService(self.assignments)
        self.analytics = AnalyticsService(self.enrollments, self.assignments, self.submissions)

    def import_enrollment_csv(self, students_csv: str, classes_csv: str, enrollments_csv: str) -> EnrollmentImportReport:
        return self.enrollments.import_csv(students_csv, classes_csv, enrollments_csv)

    def export_enrollment_csv(self) -> Dict[str, str]:
        return self.enrollments.export_csv()

    def create_assignment(self, assignment_id: str, class_id: str, title: str, description: str, rubric: List[RubricCriterion]) -> AssignmentResponse:
        assignment = self.assignments.create_assignment(assignment_id, class_id, title, description, rubric)
        return AssignmentResponse(assignment=assignment)

    def edit_assignment(
        self,
        assignment_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        rubric: Optional[List[RubricCriterion]] = None,
    ) -> AssignmentResponse:
        assignment = self.assignments.edit_assignment(assignment_id, title=title, description=description, rubric=rubric)
        return AssignmentResponse(assignment=assignment)

    def autosave_assignment_draft(self, assignment_id: str, student_id: str, content: str) -> DraftVersion:
        return self.submissions.autosave_draft(assignment_id, student_id, content)

    def submit_assignment(self, assignment_id: str, student_id: str, content: str) -> SubmissionVersion:
        return self.submissions.submit(assignment_id, student_id, content)

    def assignment_submission_history(self, assignment_id: str, student_id: str) -> List[SubmissionVersion]:
        return self.submissions.get_submission_history(assignment_id, student_id)

    def score_assignment(self, assignment_id: str, student_id: str, rubric_scores: Dict[str, float]) -> ScoreResponse:
        return self.submissions.score_submission(assignment_id, student_id, rubric_scores)

    def teacher_progress(self, class_id: str) -> TeacherProgressResponse:
        return self.analytics.teacher_progress(class_id)

    def student_timeline(self, student_id: str) -> StudentTimelineResponse:
        return self.analytics.student_timeline(student_id)

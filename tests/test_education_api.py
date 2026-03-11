import unittest

from education_api import EducationAPI, RubricCriterion


class EducationApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.api = EducationAPI()

    def test_csv_import_validation_and_export(self) -> None:
        report = self.api.import_enrollment_csv(
            students_csv="student_id,name\ns1,Ada\n,Missing\ns1,Duplicate\n",
            classes_csv="class_id,title\nc1,Math\nc1,Duplicate\n",
            enrollments_csv="student_id,class_id\ns1,c1\nmissing,c1\ns1,missing\ns1,c1\n",
        )

        self.assertEqual(report.students_imported, 1)
        self.assertEqual(report.classes_imported, 1)
        self.assertEqual(report.enrollments_imported, 1)
        self.assertEqual(len(report.errors), 6)

        exported = self.api.export_enrollment_csv()
        self.assertIn("s1,Ada", exported["students_csv"])
        self.assertIn("c1,Math", exported["classes_csv"])
        self.assertIn("s1,c1", exported["enrollments_csv"])

    def test_assignments_scoring_autosave_and_timelines(self) -> None:
        self.api.import_enrollment_csv(
            students_csv="student_id,name\ns1,Ada\n",
            classes_csv="class_id,title\nc1,Math\n",
            enrollments_csv="student_id,class_id\ns1,c1\n",
        )

        rubric = [
            RubricCriterion("clarity", "Clarity", 5),
            RubricCriterion("accuracy", "Accuracy", 10),
        ]
        assignment = self.api.create_assignment("a1", "c1", "Essay", "Write an essay", rubric).assignment
        self.assertEqual(assignment.max_points, 15)

        edited = self.api.edit_assignment("a1", title="Updated Essay").assignment
        self.assertEqual(edited.title, "Updated Essay")

        d1 = self.api.autosave_assignment_draft("a1", "s1", "draft1")
        d2 = self.api.autosave_assignment_draft("a1", "s1", "draft2")
        self.assertEqual((d1.version, d2.version), (1, 2))

        s1 = self.api.submit_assignment("a1", "s1", "submission v1")
        s2 = self.api.submit_assignment("a1", "s1", "submission v2")
        self.assertEqual((s1.version, s2.version), (1, 2))
        history = self.api.assignment_submission_history("a1", "s1")
        self.assertEqual(len(history), 2)

        score = self.api.score_assignment("a1", "s1", {"clarity": 4, "accuracy": 8})
        self.assertEqual(score.total_points, 12)
        self.assertEqual(score.max_points, 15)

        teacher_progress = self.api.teacher_progress("c1")
        self.assertEqual(teacher_progress.assignment_count, 1)
        self.assertEqual(len(teacher_progress.student_progress), 1)
        self.assertEqual(teacher_progress.student_progress[0].completion_rate, 1.0)

        timeline = self.api.student_timeline("s1")
        event_types = [event.event_type for event in timeline.events]
        self.assertIn("draft_autosaved", event_types)
        self.assertIn("submission_created", event_types)
        self.assertIn("submission_graded", event_types)


if __name__ == "__main__":
    unittest.main()

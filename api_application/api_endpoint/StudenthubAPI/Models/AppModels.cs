namespace StudenthubAPI.Models
{
    // =============================================
    // COMMON MODELS
    // =============================================
    public class CommonOutput
    {
        public string OutPut { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public Dictionary<string, string> Errors { get; set; }
    }

    // =============================================
    // USER MODELS
    // =============================================
    public class User
    {
        public int UserID { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UserWithRole : User
    {
        public string Role { get; set; }
    }

    // =============================================
    // STUDENT MODELS
    // =============================================
    public class Student
    {
        public int id { get; set; }
        public string name { get; set; }
        public string student_code { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public DateTime? date_of_birth { get; set; }
        public string gender { get; set; }
        public string address { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public int id_proof_type_id { get; set; }
        public string id_proof_type { get; set; }
        public string id_proof_number { get; set; }
        public int caste_id { get; set; }
        public string caste_category { get; set; }
    }

    // =============================================
    // TEACHER MODELS
    // =============================================
    public class Teacher
    {
        public int TeacherID { get; set; }
        public int? UserID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string IDProofNumber { get; set; }
        public string IDProofType { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // =============================================
    // CLUSTER MODELS
    // =============================================
    public class Cluster
    {
        public int ClusterID { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int? GeoRadiusMeters { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // =============================================
    // PROGRAM MODELS
    // =============================================
    public class Program
    {
        public int ProgramID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // =============================================
    // DONOR MODELS
    // =============================================
    public class Donor
    {
        public int DonorID { get; set; }
        public string DonorCode { get; set; }
        public string Name { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string IDProofNumber { get; set; }
        public string IDProofType { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // =============================================
    // ACADEMIC YEAR MODELS
    // =============================================
    public class AcademicYear
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // =============================================
    // ATTENDANCE MODELS
    // =============================================
    public class AttendanceRecord
    {
        public int AttendanceRecordID { get; set; }
        public int StudentID { get; set; }
        public string StudentName { get; set; }
        public string StudentCode { get; set; }
        public DateTime AttendanceDate { get; set; }
        public string Status { get; set; }
        public string StatusCode { get; set; }
        public string ClusterName { get; set; }
        public string ProgramName { get; set; }
        public string AcademicYear { get; set; }
        public string MarkedByTeacher { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public DateTime MarkedAt { get; set; }
    }

    // =============================================
    // MASTER DATA MODELS
    // =============================================
    public class IDProofType
    {
        public int IDProofTypeID { get; set; }
        public string Name { get; set; }
    }

    public class CasteCategory
    {
        public int CasteCategoryID { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }

    public class AttendanceStatusType
    {
        public int AttendanceStatusTypeID { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }

    public class PaymentModeType
    {
        public int PaymentModeID { get; set; }
        public string Name { get; set; }
    }

    public class City
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string State { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class State
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class Ambition
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class Hobby
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // =============================================
    // INPUT MODELS FOR MASTER DATA
    // =============================================
    public class CityInput
    {
        public string name { get; set; }
        public string state { get; set; }
    }

    public class StateInput
    {
        public string name { get; set; }
        public string code { get; set; }
    }

    public class AmbitionInput
    {
        public string name { get; set; }
    }

    public class HobbyInput
    {
        public string name { get; set; }
    }

    // =============================================
    // DASHBOARD MODELS
    // =============================================
    public class DashboardStats
    {
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalDonors { get; set; }
        public int AttendanceToday { get; set; }
    }

    public class AttendanceInsight
    {
        public int ClusterID { get; set; }
        public string ClusterName { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
    }

    public class AttendanceTrend
    {
        public DateTime Date { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
    }

    public class Donation
    {
        public int Id { get; set; }
        public int DonorId { get; set; }
        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }
        public int? PaymentModeID { get; set; }
        public string ReferenceNumber { get; set; }
        public string Currency { get; set; }
        public string Remarks { get; set; }
    }

    // =============================================
    // TEACHER SUBJECTS MODELS
    // =============================================
    public class TeacherSubject
    {
        public int SubjectID { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }

    public class TeacherSubjectMapping
    {
        public int id { get; set; }
        public int subject_id { get; set; }
        public string name { get; set; }
        public string code { get; set; }
    }

    // =============================================
    // LEARNING CENTRE MODELS
    // =============================================
    public class LearningCentre
    {
        public int id { get; set; }
        public int cluster_id { get; set; }
        public string cluster_name { get; set; }
        public string name { get; set; }
        public string address { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public decimal? latitude { get; set; }
        public decimal? longitude { get; set; }
        public int? geo_radius_meters { get; set; }
        public bool is_active { get; set; }
        public DateTime created_at { get; set; }
    }

    // =============================================
    // PARENT MODELS
    // =============================================
    public class Parent
    {
        public int id { get; set; }
        public string parent_code { get; set; }
        public string name { get; set; }
        public string relationship { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string occupation { get; set; }
        public string address { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public decimal? annual_income { get; set; }
        public string bank_name { get; set; }
        public string bank_account_number { get; set; }
        public int? id_proof_type_id { get; set; }
        public string id_number { get; set; }
        public string notes { get; set; }
        public bool is_active { get; set; }
        public DateTime created_at { get; set; }
    }

    public class StudentParent
    {
        public int id { get; set; }
        public string parent_code { get; set; }
        public string name { get; set; }
        public string relationship { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string occupation { get; set; }
        public string address { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public decimal? annual_income { get; set; }
        public string bank_name { get; set; }
        public string bank_account_number { get; set; }
        public int? id_proof_type_id { get; set; }
        public string id_number { get; set; }
        public string notes { get; set; }
        public bool is_primary { get; set; }
        public DateTime created_at { get; set; }
    }

    public class StudentSibling
    {
        public int id { get; set; }
        public string name { get; set; }
        public string student_code { get; set; }
        public DateTime? date_of_birth { get; set; }
        public string class_grade { get; set; }
    }

    // =============================================
    // SCHOOL TYPE & MEDIUM MODELS
    // =============================================
    public class SchoolType
    {
        public int SchoolTypeID { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }

    public class StudentMedium
    {
        public int MediumID { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }
}

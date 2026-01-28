using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudenthubAPI.BO
{
    // =============================================
    // USERS BO
    // =============================================
    public class UserBO
    {
        [JsonPropertyName("id")]
        public int UserID { get; set; }
        [JsonPropertyName("email")]
        public string Email { get; set; }
        [JsonPropertyName("full_name")]
        public string FullName { get; set; }
        [JsonPropertyName("phone")]
        public string Phone { get; set; }
        [JsonPropertyName("role")]
        public string Role { get; set; }
        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }
        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }
        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateUserBO
    {
        [JsonPropertyName("full_name")]
        public string FullName { get; set; }
        [JsonPropertyName("phone")]
        public string Phone { get; set; }
        [JsonPropertyName("role")]
        public string Role { get; set; }
    }

    public class UpdateUserRoleBO
    {
        [JsonPropertyName("role")]
        public string Role { get; set; }
    }

    // =============================================
    // STUDENTS BO
    // =============================================

    public class StudentBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("student_code")]
        public string Student_Code { get; set; }

        [JsonPropertyName("dob")]
        public DateTime Dob { get; set; }

        [JsonPropertyName("gender")]
        public string? Gender { get; set; }

        [JsonPropertyName("city")]
        public string? City { get; set; }

        [JsonPropertyName("state")]
        public string? State { get; set; }

        [JsonPropertyName("ambition")]
        public string? Ambition { get; set; }

        [JsonPropertyName("hobbies")]
        public string? Hobbies { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

        [JsonPropertyName("caste_category_id")]
        public int Caste_Category_Id { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int Id_Proof_Type_Id { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string Id_Proof_Number { get; set; }

        [JsonPropertyName("photo_document_id")]
        public int Photo_Document_Id { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("phone")]
        public string? Phone { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime Created_At { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime? Updated_At { get; set; }

        [JsonPropertyName("is_active")]
        public bool Is_Active { get; set; }

        [JsonPropertyName("academic_record_id")]
        public int Academic_Record_Id { get; set; }

        [JsonPropertyName("cluster_id")]
        public int Cluster_Id { get; set; }

        [JsonPropertyName("program_id")]
        public int Program_Id { get; set; }

        [JsonPropertyName("academic_year_id")]
        public int Academic_Year_Id { get; set; }

        [JsonPropertyName("class_grade")]
        public string Class_Grade { get; set; }

        [JsonPropertyName("school_name")]
        public string School_Name { get; set; }

        [JsonPropertyName("attendance_percentage")]
        public decimal? Attendance_Percentage { get; set; }

        [JsonPropertyName("result_percentage")]
        public decimal? Result_Percentage { get; set; }

        [JsonPropertyName("caste_category")]
        public string Caste_Category { get; set; }

        [JsonPropertyName("id_proof_type")]
        public string Id_Proof_Type { get; set; }

        [JsonPropertyName("cluster")]
        public string Cluster { get; set; }

        [JsonPropertyName("program")]
        public string Program { get; set; }

        [JsonPropertyName("academic_year_name")]
        public string AcademicYearName { get; set; }

        [JsonPropertyName("academic_year_is_current")]
        public bool AcademicYearIsCurrent { get; set; }
    }

    public class CreateStudentBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("student_code")]
        public string? StudentCode { get; set; }

        [JsonPropertyName("dob")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("ambition")]
        public string? Ambition { get; set; }

        [JsonPropertyName("hobbies")]
        public string[]? Hobbies { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int? IDProofTypeID { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string IDNumber { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("caste_category_id")]
        public int? CasteID { get; set; }

        [JsonPropertyName("gender")]
        public string? Gender { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("phone")]
        public string? Phone { get; set; }
    }

    public class UpdateStudentBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("student_code")]
        public string? StudentCode { get; set; }

        [JsonPropertyName("dob")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("ambition")]
        public string? Ambition { get; set; }

        [JsonPropertyName("hobbies")]
        public string[]? Hobbies { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int? IDProofTypeID { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string IDNumber { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("casteID")]
        public int? CasteID { get; set; }

        [JsonPropertyName("gender")]
        public string? Gender { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("phone")]
        public string? Phone { get; set; }
    }

    public class StudentAcademicRecordBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("student_id")]
        public int StudentId { get; set; }

        [JsonPropertyName("academic_year_id")]
        public int AcademicYearId { get; set; }

        [JsonPropertyName("cluster_id")]
        public int ClusterId { get; set; }

        [JsonPropertyName("program_id")]
        public int ProgramId { get; set; }

        [JsonPropertyName("school_name")]
        public string? SchoolName { get; set; }

        [JsonPropertyName("class_grade")]
        public string? ClassGrade { get; set; }

        [JsonPropertyName("attendance_percentage")]
        public decimal? AttendancePercentage { get; set; }

        [JsonPropertyName("result_percentage")]
        public decimal? ResultPercentage { get; set; }

        [JsonPropertyName("yearly_fees")]
        public decimal? YearlyFees { get; set; }

        [JsonPropertyName("remarks")]
        public string? Remarks { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("cluster_name")]
        public string? ClusterName { get; set; }

        [JsonPropertyName("program_name")]
        public string? ProgramName { get; set; }

        [JsonPropertyName("academic_year_name")]
        public string? AcademicYearName { get; set; }

        [JsonPropertyName("academic_year_is_current")]
        public bool AcademicYearIsCurrent { get; set; }
    }

    public class CreateAcademicRecordBO
    {
        [JsonPropertyName("student_id")]
        public int StudentID { get; set; }

        [JsonPropertyName("academic_year_id")]
        public int AcademicYearID { get; set; }

        [JsonPropertyName("cluster_id")]
        public int ClusterID { get; set; }

        [JsonPropertyName("program_id")]
        public int ProgramID { get; set; }

        [JsonPropertyName("school_name")]
        public string? SchoolName { get; set; }

        [JsonPropertyName("class_grade")]
        public string? ClassGrade { get; set; }

        [JsonPropertyName("attendance_percentage")]
        public decimal? AttendancePercentage { get; set; }

        [JsonPropertyName("result_percentage")]
        public decimal? ResultPercentage { get; set; }

        [JsonPropertyName("yearly_fees")]
        public decimal? YearlyFees { get; set; }

        [JsonPropertyName("remarks")]
        public string? Remarks { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; } = true;
    }

    public class UpdateAcademicRecordBO : CreateAcademicRecordBO
    {
        // StudentAcademicRecordID is passed as route param, not in body
    }

    // =============================================
    // TEACHERS BO
    // =============================================

    public class TeacherBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("gender")]
        public string Gender { get; set; }

        [JsonPropertyName("dob")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int IdProofTypeId { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string IdProofNumber { get; set; }

        [JsonPropertyName("photo_document_id")]
        public int PhotoDocumentId { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("id_proof_type")]
        public string IdProofType { get; set; }

        [JsonPropertyName("teacher_assignment_id")]
        public int TeacherAssignmentId { get; set; }

        [JsonPropertyName("cluster_id")]
        public int ClusterId { get; set; }

        [JsonPropertyName("program_id")]
        public int ProgramId { get; set; }

        [JsonPropertyName("academic_year_id")]
        public int AcademicYearId { get; set; }

        [JsonPropertyName("role")]
        public string Role { get; set; }

        [JsonPropertyName("cluster")]
        public string Cluster { get; set; }

        [JsonPropertyName("program")]
        public string Program { get; set; }

        [JsonPropertyName("academic_year_name")]
        public string AcademicYearName { get; set; }

        [JsonPropertyName("academic_year_is_current")]
        public bool AcademicYearIsCurrent { get; set; }
    }

    public class CreateTeacherBO
    {
        [JsonPropertyName("user_id")]
        public int? UserID { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("gender")]
        public string Gender { get; set; }

        [JsonPropertyName("dob")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int? IDProofTypeID { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string IDNumber { get; set; }
    }

    public class UpdateTeacherBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("gender")]
        public string Gender { get; set; }

        [JsonPropertyName("dob")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int? IDProofTypeID { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string IDNumber { get; set; }
    }

    // =============================================
    // CLUSTERS BO
    // =============================================
    public class ClusterBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }

        [JsonPropertyName("latitude")]
        public decimal? Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public decimal? Longitude { get; set; }

        [JsonPropertyName("geo_radius_meters")]
        public int? GeoRadiusMeters { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    public class ClusterStatsBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }

        [JsonPropertyName("latitude")]
        public decimal? Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public decimal? Longitude { get; set; }

        [JsonPropertyName("geo_radius_meters")]
        public int? GeoRadiusMeters { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("student_count")]
        public int? StudentCount { get; set; }

        [JsonPropertyName("teacher_count")]
        public int? TeacherCount { get; set; }

        [JsonPropertyName("programs")]
        public string? Programs { get; set; }
     
    }

    public class CreateClusterBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }

        [JsonPropertyName("latitude")]
        public decimal? Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public decimal? Longitude { get; set; }

        [JsonPropertyName("geo_radius_meters")]
        public int? GeoRadiusMeters { get; set; }
    }

    public class UpdateClusterBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }

        [JsonPropertyName("latitude")]
        public decimal? Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public decimal? Longitude { get; set; }

        [JsonPropertyName("geo_radius_meters")]
        public int? GeoRadiusMeters { get; set; }
    }

    // =============================================
    // PROGRAMS BO
    // =============================================
    public class ProgramBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    public class ProgramStatsBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("cluster_count")]
        public int ClusterCount { get; set; }

        [JsonPropertyName("student_count")]
        public int StudentCount { get; set; }

        [JsonPropertyName("teacher_count")]
        public int TeacherCount { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateProgramBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }
    }

    public class UpdateProgramBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string Description { get; set; }
    }

    // =============================================
    // DONORS BO
    // =============================================
    public class DonorBO
    {
        [JsonPropertyName("donor_id")]
        public int DonorID { get; set; }

        [JsonPropertyName("donor_code")]
        public string DonorCode { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string IDProofNumber { get; set; }

        [JsonPropertyName("id_proof_type")]
        public string IDProofType { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateDonorBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int? IDProofTypeID { get; set; }

        [JsonPropertyName("id_number")]
        public string IDNumber { get; set; }

        [JsonPropertyName("company")]
        public string Company { get; set; }

        [JsonPropertyName("donor_type")]
        public string DonorType { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }
    }

    public class UpdateDonorBO
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int? IDProofTypeID { get; set; }

        [JsonPropertyName("id_number")]
        public string IDNumber { get; set; }

        [JsonPropertyName("company")]
        public string Company { get; set; }

        [JsonPropertyName("donor_type")]
        public string DonorType { get; set; }

        [JsonPropertyName("email")]
        public string Email { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }
    }

    // =============================================
    // ACADEMIC YEARS BO
    // =============================================
    public class AcademicYearBO
    {
        [JsonPropertyName("academic_year_id")]
        public int AcademicYearID { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("start_date")]
        public DateTime StartDate { get; set; }

        [JsonPropertyName("end_date")]
        public DateTime EndDate { get; set; }

        [JsonPropertyName("is_current")]
        public bool IsCurrent { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    // =============================================
    // ATTENDANCE BO
    // =============================================
    public class AttendanceRecordBO
    {
        [JsonPropertyName("attendance_record_id")]
        public int AttendanceRecordID { get; set; }

        [JsonPropertyName("student_id")]
        public int StudentID { get; set; }

        [JsonPropertyName("student_name")]
        public string StudentName { get; set; }

        [JsonPropertyName("student_code")]
        public string StudentCode { get; set; }

        [JsonPropertyName("attendance_date")]
        public DateTime AttendanceDate { get; set; }

        [JsonPropertyName("status_id")]
        public int StatusId { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }

        [JsonPropertyName("status_code")]
        public string StatusCode { get; set; }

        [JsonPropertyName("cluster_id")]
        public int ClusterID { get; set; }

        [JsonPropertyName("program_id")]
        public int ProgramID { get; set; }

        [JsonPropertyName("cluster_name")]
        public string ClusterName { get; set; }

        [JsonPropertyName("program_name")]
        public string ProgramName { get; set; }

        [JsonPropertyName("academic_year_id")]
        public int AcademicYearID { get; set; }

        [JsonPropertyName("academic_year")]
        public string AcademicYear { get; set; }

        [JsonPropertyName("marked_by_teacher_id")]
        public int MarkedByTeacherID { get; set; }

        [JsonPropertyName("marked_by_teacher")]
        public string MarkedByTeacher { get; set; }

        [JsonPropertyName("latitude")]
        public decimal? Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public decimal? Longitude { get; set; }

        [JsonPropertyName("marked_at")]
        public DateTime MarkedAt { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    public class AttendanceReportBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("attendance_date")]
        public DateTime AttendanceDate { get; set; }

        [JsonPropertyName("status_code")]
        public string StatusCode { get; set; } = string.Empty;

        [JsonPropertyName("status_name")]
        public string StatusName { get; set; } = string.Empty;

        [JsonPropertyName("student_name")]
        public string StudentName { get; set; } = string.Empty;

        [JsonPropertyName("student_code")]
        public string StudentCode { get; set; } = string.Empty;

        [JsonPropertyName("cluster_id")]
        public int ClusterId { get; set; }

        [JsonPropertyName("cluster_name")]
        public string ClusterName { get; set; } = string.Empty;

        [JsonPropertyName("program_id")]
        public int ProgramId { get; set; }

        [JsonPropertyName("program_name")]
        public string ProgramName { get; set; } = string.Empty;

        [JsonPropertyName("teacher_name")]
        public string? TeacherName { get; set; }

        [JsonPropertyName("marked_at")]
        public DateTime MarkedAt { get; set; }
    }

    public class UpsertAttendanceRecordBO
    {
        [JsonPropertyName("student_id")]
        public int StudentID { get; set; }

        [JsonPropertyName("academic_year_id")]
        public int AcademicYearID { get; set; }

        [JsonPropertyName("cluster_id")]
        public int ClusterID { get; set; }

        [JsonPropertyName("program_id")]
        public int ProgramID { get; set; }

        [JsonPropertyName("attendance_date")]
        public DateTime AttendanceDate { get; set; }

        [JsonPropertyName("status_id")]
        public int StatusID { get; set; }

        [JsonPropertyName("marked_by_teacher_id")]
        public int? MarkedByTeacherID { get; set; }

        [JsonPropertyName("marked_by_user_id")]
        public int? MarkedByUserID { get; set; }

        [JsonPropertyName("latitude")]
        public decimal? Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public decimal? Longitude { get; set; }
    }

    public class BulkUpsertAttendanceRequest
    {
        public List<UpsertAttendanceRecordBO> Records { get; set; } = new();
    }

    public class AttendanceStudentsBO
    {
        [JsonPropertyName("id")]
        public int ID { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("student_code")]
        public string Student_Code { get; set; }
    }


    // =============================================
    // DONATION BO
    // =============================================    
    public class DonationBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("donor_id")]
        public int DonorId { get; set; }

        [JsonPropertyName("amount")]
        public decimal Amount { get; set; }

        [JsonPropertyName("donation_date")]
        public DateTime DonationDate { get; set; }

        [JsonPropertyName("payment_mode_id")]
        public int? PaymentModeID { get; set; }

        [JsonPropertyName("reference_number")]
        public string ReferenceNumber { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; }

        [JsonPropertyName("remarks")]
        public string Remarks { get; set; }
    }

    public class CreateDonationBO
    {
        [JsonPropertyName("donor_id")]
        public int DonorId { get; set; }

        [JsonPropertyName("amount")]
        public decimal Amount { get; set; }

        [JsonPropertyName("donation_date")]
        public DateTime DonationDate { get; set; }

        [JsonPropertyName("payment_mode_id")]
        public int? PaymentModeID { get; set; }

        [JsonPropertyName("reference_number")]
        public string ReferenceNumber { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; }

        [JsonPropertyName("remarks")]
        public string Remarks { get; set; }
    }

    public class UpdateDonationBO : CreateDonationBO
    {
        // Inherits all properties
    }

    // =============================================
    // TEACHER ASSIGNMENT BO
    // =============================================    
    public class TeacherAssignmentBO
    {
        [JsonPropertyName("teacher_id")]
        public int teacher_id { get; set; }

        [JsonPropertyName("academic_year_id")]
        public int academic_year_id { get; set; }

        [JsonPropertyName("cluster_id")]
        public int cluster_id { get; set; }

        [JsonPropertyName("program_id")]
        public int program_id { get; set; }

        [JsonPropertyName("role")]
        public string role { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; } = true;
    }

    public class TeacherIdLookup
    {
        [JsonPropertyName("teacher_id")]
        public int TeacherID { get; set; }

        [JsonPropertyName("user_id")]
        public int UserID { get; set; }
    }

    // =============================================
    // FAMILY MEMBER BO
    // =============================================    

    public class FamilyMemberBO
    {
        [JsonPropertyName("id")]
        public int FamilyMemberID { get; set; }

        [JsonPropertyName("student_id")]
        public int StudentID { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("relationship")]
        public string Relationship { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int? IDProofTypeID { get; set; }

        [JsonPropertyName("id_proof_type")]
        public string? IdProofTypeName { get; set; }

        [JsonPropertyName("photo_document_id")]
        public int PhotoDocumentID { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string IDNumber { get; set; }

        // optional extended details
        [JsonPropertyName("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("occupation")]
        public string Occupation { get; set; }

        [JsonPropertyName("annual_income")]
        public decimal? AnnualIncome { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("bank_name")]
        public string BankName { get; set; }

        [JsonPropertyName("bank_account_number")]
        public string BankAccountNumber { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

        [JsonPropertyName("gender")]
        public string? Gender { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }
    }

    public class CreateFamilyMemberBO
    {
        [JsonPropertyName("student_id")]
        public int StudentID { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("relationship")]
        public string Relationship { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int? IDProofTypeID { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string IDNumber { get; set; }

        [JsonPropertyName("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("occupation")]
        public string Occupation { get; set; }

        [JsonPropertyName("annual_income")]
        public decimal? AnnualIncome { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("bank_name")]
        public string BankName { get; set; }

        [JsonPropertyName("bank_account_number")]
        public string BankAccountNumber { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

        [JsonPropertyName("gender")]
        public string? Gender { get; set; }
    }

    public class UpdateFamilyMemberBO
    {
        [JsonPropertyName("student_id")]
        public int? StudentID { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("relationship")]
        public string Relationship { get; set; }

        [JsonPropertyName("phone")]
        public string Phone { get; set; }

        [JsonPropertyName("id_proof_type_id")]
        public int? IDProofTypeID { get; set; }

        [JsonPropertyName("id_proof_number")]
        public string IDNumber { get; set; }

        [JsonPropertyName("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [JsonPropertyName("occupation")]
        public string Occupation { get; set; }

        [JsonPropertyName("annual_income")]
        public decimal? AnnualIncome { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("bank_name")]
        public string BankName { get; set; }

        [JsonPropertyName("bank_account_number")]
        public string BankAccountNumber { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

        [JsonPropertyName("gender")]
        public string? Gender { get; set; }
    }


    // =============================================
    // MASTER DATA INPUT MODELS
    // =============================================
    public class IdProofTypeInput
    {
        public string? name { get; set; }
    }

    public class CasteCategoryInput
    {
        public string? name { get; set; }
        public string? code { get; set; }
    }

    public class AttendanceStatusTypeInput
    {
        public string? name { get; set; }
        public string? code { get; set; }
    }

    public class PaymentModeInput
    {
        public string? name { get; set; }
    }

    // =============================================
    // DASHBOARD DATA BOs
    // =============================================
    public class ClusterProgramCombinationBO
    {
        [JsonPropertyName("cluster_id")]
        public int ClusterId { get; set; }

        [JsonPropertyName("program_id")]
        public int ProgramId { get; set; }

        [JsonPropertyName("cluster_name")]
        public string ClusterName { get; set; }

        [JsonPropertyName("program_name")]
        public string ProgramName { get; set; }

        [JsonPropertyName("cluster_city")]
        public string ClusterCity { get; set; }

        [JsonPropertyName("student_count")]
        public int StudentCount { get; set; }
    }

    public class SummaryStatsBO
    {
        //[JsonPropertyName("active_students")]
        public int ActiveStudents { get; set; }

        //[JsonPropertyName("program_wise_students")]
        public string ProgramWiseStudentsRaw { get; set; } 

        //[JsonPropertyName("total_teachers")]
        public int TotalTeachers { get; set; }

        //[JsonPropertyName("main_teachers")]
        public int MainTeachers { get; set; }

        //[JsonPropertyName("backup_teachers")]
        public int BackupTeachers { get; set; }

        //[JsonPropertyName("volunteers")]
        public int Volunteers { get; set; }

        [NotMapped]
        public List<ProgramWiseStudentBO> ProgramWiseStudents { get; set; } = new();
    }

    public class ProgramWiseStudentBO
    {
        //[JsonPropertyName("program")]
        public string Program { get; set; }

        //[JsonPropertyName("count")]
        public int Count { get; set; }
    }

    public class AttendanceStatsBO
    {
        //[JsonPropertyName("attendance_percentage")]
        public int AttendancePercentage { get; set; }

        //[JsonPropertyName("total_present")]
        public int TotalPresent { get; set; }

        //[JsonPropertyName("total_expected")]
        public int TotalExpected { get; set; }

        //[JsonPropertyName("trend_data")]
        public List<AttendanceTrendBO> TrendData { get; set; }
    }

    public class AttendanceTrendBO
    {
        //[JsonPropertyName("date")]
        public string Date { get; set; }

        //[JsonPropertyName("percentage")]
        public int Percentage { get; set; }
    }

    public class TeacherUnavailableBO
    {
        //[JsonPropertyName("main_teacher_id")]
        public string MainTeacherId { get; set; }

        //[JsonPropertyName("main_teacher_name")]
        public string MainTeacherName { get; set; }

        //[JsonPropertyName("program_name")]
        public string ProgramName { get; set; }

        //[JsonPropertyName("cluster_name")]
        public string ClusterName { get; set; }

        //[JsonPropertyName("backup_teacher_name")]
        public string BackupTeacherName { get; set; }

        //[JsonPropertyName("missed_days")]
        public int MissedDays { get; set; }
    }

    public class ClusterNeedingAttentionBO
    {
        //[JsonPropertyName("teacher_name")]
        public string TeacherName { get; set; }

        //[JsonPropertyName("program_name")]
        public string ProgramName { get; set; }

        //[JsonPropertyName("cluster_name")]
        public string ClusterName { get; set; }

        //[JsonPropertyName("missed_updates")]
        public int MissedUpdates { get; set; }

        //[JsonPropertyName("attendance_percentage")]
        public int AttendancePercentage { get; set; }
    }

    public class AbsentStudentBO
    {
        //[JsonPropertyName("id")]
        public int Id { get; set; }

        //[JsonPropertyName("name")]
        public string Name { get; set; }

        //[JsonPropertyName("program_name")]
        public string ProgramName { get; set; }

        //[JsonPropertyName("cluster_name")]
        public string ClusterName { get; set; }

        //[JsonPropertyName("present_count")]
        public int PresentCount { get; set; }

        //[JsonPropertyName("absent_count")]
        public int AbsentCount { get; set; }
    }

    public class ClusterPerformanceBO
    {
        //[JsonPropertyName("performance_type")]
        public string PerformanceType { get; set; }

        //[JsonPropertyName("cluster_name")]
        public string ClusterName { get; set; }

        //[JsonPropertyName("attendance_percentage")]
        public int AttendancePercentage { get; set; }
    }

    public class ClusterPerformanceResponseBO
    {
        //[JsonPropertyName("best_clusters")]
        public List<ClusterPerformanceItemBO> BestClusters { get; set; }

        //[JsonPropertyName("worst_clusters")]
        public List<ClusterPerformanceItemBO> WorstClusters { get; set; }
    }

    public class ClusterPerformanceItemBO
    {
        //[JsonPropertyName("cluster_name")]
        public string ClusterName { get; set; }

        //[JsonPropertyName("attendance_percentage")]
        public int AttendancePercentage { get; set; }
    }

    public class DonorDashboardStatsBO
    {
        public int TotalDonors { get; set; }
        public int RegularDonors { get; set; }
        public int NewDonorsThisYear { get; set; }
        public int AdhocDonors { get; set; }
    }

    public class DonorYearComparisonBO
    {
        public decimal LastYearTotal { get; set; }
        public decimal ThisYearTotal { get; set; }
        public decimal PercentageChange { get; set; }
    }

    public class MonthlyDonationTrendBO
    {
        public string Month { get; set; }
        public decimal CurrentYear { get; set; }
        public decimal PreviousYear { get; set; }
    }

    // Query parameters BO
    public class DashboardFilterBO
    {
        //[JsonPropertyName("start_date")]
        public DateTime StartDate { get; set; }

        //[JsonPropertyName("end_date")]
        public DateTime EndDate { get; set; }

        //[JsonPropertyName("program_id")]
        public int? ProgramId { get; set; }

        //[JsonPropertyName("cluster_id")]
        public int? ClusterId { get; set; }
    }

    // =============================================
    // DOCUMENTS BO
    // =============================================

    public class DocumentSettings
    {
        public long MaxFileSize { get; set; }
        public string[] AllowedExtensions { get; set; }
        public string StoragePath { get; set; } = string.Empty;
        public bool EnableVirus { get; set; }
        public bool AllowPublicAccess { get; set; }
    }

    public class DocumentBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("reference_type")]
        public string ReferenceType { get; set; }

        [JsonPropertyName("reference_id")]
        public int ReferenceId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("document_type")]
        public string? DocumentType { get; set; }

        [JsonPropertyName("file_url")]
        public string FileUrl { get; set; }

        [JsonPropertyName("file_type")]
        public string? FileType { get; set; }

        [JsonPropertyName("file_size")]
        public long? FileSize { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("tags")]
        public string? Tags { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("is_verified")]
        public bool IsVerified { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    public class DocumentDetailBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("reference_type")]
        public string ReferenceType { get; set; }

        [JsonPropertyName("reference_id")]
        public int ReferenceId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("document_type")]
        public string? DocumentType { get; set; }

        [JsonPropertyName("file_url")]
        public string FileUrl { get; set; }

        [JsonPropertyName("file_type")]
        public string? FileType { get; set; }

        [JsonPropertyName("file_size")]
        public long? FileSize { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("tags")]
        public string? Tags { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }

        [JsonPropertyName("is_verified")]
        public bool IsVerified { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("uploaded_by")]
        public int? UploadedBy { get; set; }

        [JsonPropertyName("verified_by")]
        public int? VerifiedBy { get; set; }

        [JsonPropertyName("verified_at")]
        public DateTime? VerifiedAt { get; set; }
    }

    public class DocumentCreateBO
    {
        [JsonPropertyName("reference_type")]
        public string ReferenceType { get; set; }

        [JsonPropertyName("reference_id")]
        public int ReferenceId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("document_type")]
        public string? DocumentType { get; set; }

        [JsonPropertyName("file_url")]
        public string FileUrl { get; set; }

        [JsonPropertyName("file_type")]
        public string? FileType { get; set; }

        [JsonPropertyName("file_size")]
        public long? FileSize { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("tags")]
        public string? Tags { get; set; }
    }

    public class DocumentUpdateBO
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("document_type")]
        public string? DocumentType { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("tags")]
        public string? Tags { get; set; }

        [JsonPropertyName("is_verified")]
        public bool? IsVerified { get; set; }
    }

    public class DocumentCategoryBO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }
    }

    public class DocumentStatsBO
    {
        [JsonPropertyName("reference_type")]
        public string ReferenceType { get; set; }

        [JsonPropertyName("total_count")]
        public int TotalCount { get; set; }

        [JsonPropertyName("verified_count")]
        public int VerifiedCount { get; set; }

        [JsonPropertyName("total_size_bytes")]
        public long? TotalSizeBytes { get; set; }

        [JsonPropertyName("latest_upload")]
        public DateTime? LatestUpload { get; set; }
    }

    public class UpdatePhotoRequest
    {
        public int DocumentId { get; set; }
    }

}

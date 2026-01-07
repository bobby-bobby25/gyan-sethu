namespace StudenthubAPI.BO
{
    // =============================================
    // USERS BO
    // =============================================
    public class UserBO
    {
        public int UserID { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateUserBO
    {
        public string FullName { get; set; }
        public string Phone { get; set; }
    }

    public class UpdateUserRoleBO
    {
        public string Role { get; set; }
    }

    // =============================================
    // STUDENTS BO
    // =============================================
    public class StudentBO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string StudentCode { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string IDProofNumber { get; set; }
        public string CasteCategory { get; set; }
        public string IDProofType { get; set; }
        public string ClassGrade { get; set; }
        public string SchoolName { get; set; }
        public decimal? AttendancePercentage { get; set; }
        public decimal? ResultPercentage { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateStudentBO
    {
        public string Name { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? IDProofTypeID { get; set; }
        public string IDNumber { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public int? CasteID { get; set; }
    }

    public class UpdateStudentBO
    {
        public string Name { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? IDProofTypeID { get; set; }
        public string IDNumber { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public int? CasteID { get; set; }
    }

    public class StudentAcademicRecordBO
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int AcademicYearId { get; set; }
        public int ClusterId { get; set; }
        public int ProgramId { get; set; }

        public string? SchoolName { get; set; }
        public string? ClassGrade { get; set; }
        public decimal? AttendancePercentage { get; set; }
        public decimal? ResultPercentage { get; set; }
        public decimal? YearlyFees { get; set; }
        public string? Remarks { get; set; }


        public bool IsActive { get; set; }
        public string? ClusterName { get; set; }
        public string? ProgramName { get; set; }
        public string? AcademicYearName { get; set; }
        public bool AcademicYearIsCurrent { get; set; }
    }

    public class CreateAcademicRecordBO
    {
        public int StudentID { get; set; }
        public int AcademicYearID { get; set; }
        public int ClusterID { get; set; }
        public int ProgramID { get; set; }
        public string? SchoolName { get; set; }
        public string? ClassGrade { get; set; }
        public decimal? AttendancePercentage { get; set; }
        public decimal? ResultPercentage { get; set; }
        public decimal? YearlyFees { get; set; }
        public string? Remarks { get; set; }
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

    public class CreateTeacherBO
    {
        public int? UserID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public int? IDProofTypeID { get; set; }
        public string IDNumber { get; set; }
    }

    public class UpdateTeacherBO
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public int? IDProofTypeID { get; set; }
        public string IDNumber { get; set; }
    }

    // =============================================
    // CLUSTERS BO
    // =============================================
    public class ClusterBO
    {
        public int Id { get; set; }
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

    public class CreateClusterBO
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int? GeoRadiusMeters { get; set; }
    }

    public class UpdateClusterBO
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public int? GeoRadiusMeters { get; set; }
    }

    // =============================================
    // PROGRAMS BO
    // =============================================
    public class ProgramBO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateProgramBO
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class UpdateProgramBO
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }

    // =============================================
    // DONORS BO
    // =============================================
    public class DonorBO
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

    public class CreateDonorBO
    {
        public string Name { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? IDProofTypeID { get; set; }
        public string IDNumber { get; set; }
        public string Company { get; set; }
        public string DonorType { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
    }

    public class UpdateDonorBO
    {
        public string Name { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public int? IDProofTypeID { get; set; }
        public string IDNumber { get; set; }
        public string Company { get; set; }
        public string DonorType { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
    }

    // =============================================
    // ACADEMIC YEARS BO
    // =============================================
    public class AcademicYearBO
    {
        public int AcademicYearID { get; set; }
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // =============================================
    // ATTENDANCE BO
    // =============================================
    public class AttendanceRecordBO
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

    public class UpsertAttendanceRecordBO
    {
        public int StudentID { get; set; }
        public int AcademicYearID { get; set; }
        public int ClusterID { get; set; }
        public int ProgramID { get; set; }
        public DateTime AttendanceDate { get; set; }
        public int StatusID { get; set; }
        public int? MarkedByTeacherID { get; set; }
        public int? MarkedByUserID { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }


    // =============================================
    // DONATION BO
    // =============================================    
    public class DonationBO
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

    public class CreateDonationBO
    {
        public int DonorId { get; set; }
        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }
        public int? PaymentModeID { get; set; }
        public string ReferenceNumber { get; set; }
        public string Currency { get; set; }
        public string Remarks { get; set; }
    }

    public class UpdateDonationBO : CreateDonationBO
    {
        // Inherits all properties
    }

    public class TeacherAssignmentBO
    {
        public int teacher_id { get; set; }
        public int academic_year_id { get; set; }
        public int cluster_id { get; set; }
        public int program_id { get; set; }
        public string role { get; set; }
        public bool IsActive { get; set; }
    }

    public class TeacherIdLookup
    {
        public int TeacherID { get; set; }
        public int UserID { get; set; }
    }
}

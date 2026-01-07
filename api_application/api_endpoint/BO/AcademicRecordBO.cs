namespace StudenthubAPI.BO
{
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
}

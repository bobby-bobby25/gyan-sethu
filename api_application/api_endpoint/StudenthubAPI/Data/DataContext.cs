using System.Collections.Generic;
using StudenthubAPI.Controllers;
using StudenthubAPI.Models;
using StudenthubAPI.BO;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Any;
using System.Configuration;
using System.Data;

namespace StudenthubAPI.Data
{
    public class DataContext : DbContext
    {
        private readonly IConfiguration _configuration;
        public string connectionString;
        public string apiBaseUrl;
        public string mainBaseUrl;
        public string tempUploadPath;
        public string docsUploadPath;
        public string templatePath;
        public string jwtKey;
        public string jwtIssuer;
        public string jwtAudience;
        public int jwtExpMin;
        public int refTokExp;
        public readonly DocumentSettings documentSettings;
        public readonly EmailSettings emailSettings;

        public DataContext(DbContextOptions<DataContext> options, IConfiguration configuration) : base(options)
        {
            _configuration = configuration;
            connectionString = configuration.GetValue<string>("ConnectionStrings:DefaultConnection");
            apiBaseUrl = configuration.GetValue<string>("APISettings:APIBaseURL");
            mainBaseUrl = configuration.GetValue<string>("APISettings:MainBaseURL");
            tempUploadPath = configuration.GetValue<string>("APISettings:TempUploadPath");
            docsUploadPath = configuration.GetValue<string>("APISettings:DocsUploadPath");
            templatePath = configuration.GetValue<string>("APISettings:TemplatePath");
            jwtKey = configuration.GetValue<string>("Jwt:Key");
            jwtIssuer = configuration.GetValue<string>("Jwt:Issuer");
            jwtAudience = configuration.GetValue<string>("Jwt:Audience");
            jwtExpMin = configuration.GetValue<int>("Jwt:AccessTokenExpiryMinutes");
            refTokExp = configuration.GetValue<int>("Jwt:RefreshTokenExpiryDays");

            //documentSettings = configuration.GetValue<DocumentSettings>("APISettings:DocumentSettings");

            documentSettings = new DocumentSettings();
            configuration
                .GetSection("APISettings:DocumentSettings")
                .Bind(documentSettings);

            emailSettings = new EmailSettings();
            configuration
                .GetSection("EmailSettings")
                .Bind(emailSettings);
        }

        #region Login
        public DbSet<LoginDetails> CheckLoginDetails { get; set; }
        public DbSet<CommonOutput> UserLogout { get; set; }
        public DbSet<CommonOutput> CheckRefreshToken { get; set; }
        public DbSet<VerificationOTP> VerificationOTPs { get; set; }
        #endregion

        #region Users
        public DbSet<UserWithRole> Users { get; set; }
        #endregion

        #region Students
        public DbSet<StudentBO> Students { get; set; }
        public DbSet<StudentAcademicRecordBO> StudentAcademicRecords { get; set; }
        public DbSet<StudentSearchBO> StudentSearch { get; set; }
        #endregion

        #region Teachers
        public DbSet<TeacherBO> Teachers { get; set; }
        #endregion

        #region Clusters
        public DbSet<ClusterBO> Clusters { get; set; }
        #endregion

        #region Family Member
        public DbSet<FamilyMemberBO> FamilyMember { get; set; }
        #endregion

        #region Programs
        public DbSet<ProgramBO> Programs { get; set; }
        #endregion

        #region Donors
        public DbSet<DonorBO> Donors { get; set; }
        #endregion

        #region Attendance
        public DbSet<AttendanceRecordBO> AttendanceRecords { get; set; }
        #endregion

        #region AcademicYears & MasterData
        public DbSet<AcademicYear> AcademicYears { get; set; }
        public DbSet<IDProofType> IDProofTypes { get; set; }
        public DbSet<CasteCategory> CasteCategories { get; set; }
        public DbSet<AttendanceStatusType> AttendanceStatusTypes { get; set; }
        public DbSet<PaymentModeType> PaymentModes { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<State> States { get; set; }
        public DbSet<Ambition> Ambitions { get; set; }
        public DbSet<Hobby> Hobbies { get; set; }
        public DbSet<DashboardStats> DashboardStats { get; set; }
        public DbSet<AttendanceInsight> AttendanceInsights { get; set; }
        public DbSet<AttendanceTrend> AttendanceTrends { get; set; }
        #endregion

        #region Donations
        public DbSet<DonationBO> Donations { get; set; }
        #endregion

        #region Teacher Subjects
        public DbSet<TeacherSubject> Subjects { get; set; }
        public DbSet<TeacherSubjectMapping> TeacherSubjectMappings { get; set; }
        #endregion

        #region Learning Centres
        public DbSet<LearningCentre> LearningCentres { get; set; }
        #endregion

        #region Parents
        public DbSet<Parent> Parents { get; set; }
        public DbSet<StudentParent> StudentParents { get; set; }
        public DbSet<StudentSibling> StudentSiblings { get; set; }
        #endregion

        #region School Type & Medium
        public DbSet<SchoolType> SchoolTypes { get; set; }
        public DbSet<StudentMedium> Mediums { get; set; }
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<LoginDetails>().HasNoKey();
            modelBuilder.Entity<CommonOutput>().HasNoKey().ToView("spMbl_CMN_CheckAddRefreshToken");

            // Configure keyless entities for stored procedures
            modelBuilder.Entity<UserWithRole>().HasNoKey();
            modelBuilder.Entity<StudentBO>().HasNoKey();
            modelBuilder.Entity<StudentAcademicRecordBO>().HasNoKey();  
            modelBuilder.Entity<TeacherBO>().HasNoKey();
            modelBuilder.Entity<TeacherIdLookup>().HasNoKey();
            modelBuilder.Entity<ClusterBO>().HasNoKey();
            modelBuilder.Entity<ClusterStatsBO>().HasNoKey();
            modelBuilder.Entity<ProgramBO>().HasNoKey();
            modelBuilder.Entity<ProgramStatsBO>().HasNoKey();
            modelBuilder.Entity<DonorBO>().HasNoKey();
            modelBuilder.Entity<AttendanceRecordBO>().HasNoKey();
            modelBuilder.Entity<AttendanceReportBO>().HasNoKey();          
            modelBuilder.Entity<AttendanceStudentsBO>().HasNoKey();
            modelBuilder.Entity<DonationBO>().HasNoKey();
            modelBuilder.Entity<FamilyMemberBO>().HasNoKey();

            
            modelBuilder.Entity<SummaryStatsBO>().HasNoKey();
            modelBuilder.Entity<ProgramWiseStudentBO>().HasNoKey();
            modelBuilder.Entity<AttendanceStatsBO>().HasNoKey();
            modelBuilder.Entity<AttendanceTrendBO>().HasNoKey();
            modelBuilder.Entity<TeacherUnavailableBO>().HasNoKey();
            modelBuilder.Entity<ClusterNeedingAttentionBO>().HasNoKey();
            modelBuilder.Entity<AbsentStudentBO>().HasNoKey();
            modelBuilder.Entity<ClusterPerformanceBO>().HasNoKey();
            modelBuilder.Entity<ClusterPerformanceItemBO>().HasNoKey();    
            modelBuilder.Entity<ClusterPerformanceResponseBO>().HasNoKey();
            modelBuilder.Entity<DonorDashboardStatsBO>().HasNoKey();
            modelBuilder.Entity<DonorYearComparisonBO>().HasNoKey();
            modelBuilder.Entity<MonthlyDonationTrendBO>().HasNoKey();
            modelBuilder.Entity<DashboardFilterBO>().HasNoKey();
            modelBuilder.Entity<DocumentBO>().HasNoKey();
            modelBuilder.Entity<DocumentDetailBO>().HasNoKey();
            modelBuilder.Entity<DocumentStatsBO>().HasNoKey();
            
                

            // Master data / dashboard keyless types
            modelBuilder.Entity<AcademicYear>().HasNoKey();
            modelBuilder.Entity<IDProofType>().HasNoKey();
            modelBuilder.Entity<CasteCategory>().HasNoKey();
            modelBuilder.Entity<AttendanceStatusType>().HasNoKey();
            modelBuilder.Entity<PaymentModeType>().HasNoKey();
            modelBuilder.Entity<DashboardStats>().HasNoKey();
            modelBuilder.Entity<AttendanceInsight>().HasNoKey();
            modelBuilder.Entity<AttendanceTrend>().HasNoKey();
            modelBuilder.Entity<LearningCentreProgramCombinationsBO>().HasNoKey();
            
            // New feature keyless types
            modelBuilder.Entity<TeacherSubject>().HasNoKey();
            modelBuilder.Entity<TeacherSubjectMapping>().HasNoKey();
            modelBuilder.Entity<LearningCentre>().HasNoKey();
            modelBuilder.Entity<Parent>().HasNoKey();
            modelBuilder.Entity<StudentParent>().HasNoKey();
            modelBuilder.Entity<StudentSibling>().HasNoKey();
            modelBuilder.Entity<SchoolType>().HasNoKey();
            modelBuilder.Entity<StudentMedium>().HasNoKey();
            modelBuilder.Entity<LearningCenterStatsBO>().HasNoKey();
            modelBuilder.Entity<Student>().HasNoKey();
            modelBuilder.Entity<StudentSearchBO>().HasNoKey();
            
        }
    }
}

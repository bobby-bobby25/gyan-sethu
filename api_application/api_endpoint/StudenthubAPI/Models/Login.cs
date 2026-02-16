namespace StudenthubAPI.Models
{
    public class LoginDetails
    {
        public int UserID { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; }
    }

    public class Common_Output
    {
        public string? OutPut { get; set; }
    }

    public class LoginUserDetailsWithJWT
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public int ExpiresIn { get; set; }
        public UserDetails User { get; set; }
        public UserProfile UserProfile { get; set; }
    }

    public class UserDetails
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }

    public class UserProfile
    {
        public int id { get; set; }
        public string email { get; set; }
        public string full_name { get; set; }
    }

    public class RegisterUserBO
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public int Role { get; set; }
        public string FullName { get; set; }
    }
}

namespace StudenthubAPI.BO
{
    public class LoginBO
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }

    public class RefreshTokenParameters
    {
        public string RefreshToken { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }    
        public int LoginId { get; set; }
        public string RefreshExpiry { get; set; }
        public string Type { get; set; }
    }

    public class UserLogout
    {
        public int UserID { get; set; }
    }
}
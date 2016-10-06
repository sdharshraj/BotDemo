using Microsoft.Bot.Builder.Dialogs;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace OlayChatBot.Models
{
    public class Util
    {
        private async static Task<T> ParseEnum<T>(string value)
        {
            try
            {
                return (T)Enum.Parse(typeof(T), value, true);
            }
            catch (Exception)
            {
                return (T)Enum.Parse(typeof(T), "none", true);
            }

        }

        internal static string ToTitleCase(string newName)
        {
            CultureInfo cultureInfo = Thread.CurrentThread.CurrentCulture;
            TextInfo textInfo = cultureInfo.TextInfo;
            return textInfo.ToTitleCase(newName.ToLower());
        }

      

        internal static string FormatDate(DateTime date)
        {
            return date.ToString("MMMM dd, yyyy");
        }

        internal static bool TryToGetValue(string text, string reg, out string value)
        {
            value = string.Empty;
            Regex r = new Regex(reg, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            Match m = r.Match(text);
            if (m.Success)
            {
                value = m.Value;
                return true;
            }
            return false;
        }

        internal static string ValidateEmail(string userEmail)
        {
            string email;
            if (Util.TryToGetValue(userEmail, @"[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?", out email))
                return email;
            return string.Empty;
        }


        public static async Task<bool> HandleException(Exception e, IDialogContext context)
        {
            string reply;
            string error = e.Message + " " + e.StackTrace;

            try
            {
                if (e.Message == "Form quit.")
                {
                    reply = ($"You quit --maybe you can finish next time!");
                }
                else if (e.Message == "An error occurred while sending the request.")
                {
                    reply = ("Unable to connect to Server, Please contact to Om Shrivastava(M1025623)!");
                }
                else if (e.InnerException == null)
                {
                    reply = ("You quit --maybe you can finish next time!");
                }
                else
                {
                    reply = ("Sorry, I've had a short circuit.  Please try again.");
                }
            }
            catch (Exception)
            {
                reply = ("Sorry, I've had a short circuit.  Please try again.");
            }
            // await context.PostAsync(reply);
            // await context.PostAsync(" Error: " + error);
            await context.PostAsync("Unable to connect to Server, Please refresh page and try again.");
            return false;
        }
        public static async Task<bool> HandleException(OperationCanceledException e, IDialogContext context)
        {
            string reply;
            string error = e.Message + " " + e.StackTrace;

            try
            {
                reply = ("You quit --maybe you can finish next time!");
            }
            catch (Exception)
            {
                reply = ("Sorry, I've had a short circuit.  Please try again.");
            }
            await context.PostAsync(reply);
            //await context.PostAsync(" Error: " + error);
            //await context.PostAsync("Unable to connect to Server, Please refresh page and try again.");
            return false;
        }
    }
}